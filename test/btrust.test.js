const BTRUST = artifacts.require("BTRUST");
require("chai")
    .use(require("chai-as-promised"))
    .expect();

const {
    address,
    minerStart,
    minerStop,
    unlockedAccount,
    mineBlock
} = require('./Utils/Ethereum');

const EIP712 = require('./Utils/EIP712');

describe('BTRUST', () => {
    const name = "BTRUST";
    const symbol = "BTRUST";

    let owner, a1, a2, accounts, chainId, result;
    let btrust;

    beforeEach(async () => {
        [owner, a1, a2, ...accounts] = await web3.eth.getAccounts();
        chainId = await web3.eth.net.getId();// See: https://github.com/trufflesuite/ganache-core/issues/515

        btrust = await BTRUST.new(owner);
    });

    describe('metadata', () => {
        it('has given name', async () => {
            expect(await btrust.name()).to.equal(name);
        });

        it('has given symbol', async () => {
            expect(await btrust.symbol()).to.equal(symbol);
        });
    });

    describe('balanceOf', () => {
        it('grants to initial account', async () => {
            const result = await btrust.balanceOf(owner);
            expect(result.toString()).to.equal("250000000000000000000000000");
        });
    });

    describe('delegateBySig', () => {
        const Domain = (token) => ({ name, chainId, verifyingContract: token.address });
        const Types = {
            Delegation: [
                { name: 'delegatee', type: 'address' },
                { name: 'nonce', type: 'uint256' },
                { name: 'expiry', type: 'uint256' }
            ]
        };

        it('reverts if the signatory is invalid', async () => {
            const delegatee = owner, nonce = 0, expiry = 0;
            expect(btrust.delegateBySig(delegatee, nonce, expiry, 0, '0x0', '0xbad')).to.eventually.be.rejectedWith("BTRUST::delegateBySig: invalid signature")
        });

        it('reverts if the nonce is bad ', async () => {
            const delegatee = owner, nonce = 1, expiry = 0;
            const signatory = web3.eth.accounts.create();
            const { v, r, s } = EIP712.sign(Domain(btrust), 'Delegation', { delegatee, nonce, expiry }, Types, signatory.privateKey);
            expect(btrust.delegateBySig(delegatee, nonce, expiry, v, r, s)).to.eventually.be.rejectedWith("revert BTRUST::delegateBySig: invalid nonce");
        });

        it('reverts if the signature has expired', async () => {
            const delegatee = owner, nonce = 0, expiry = 0;
            const signatory = web3.eth.accounts.create();
            const { v, r, s } = EIP712.sign(Domain(btrust), 'Delegation', { delegatee, nonce, expiry }, Types, signatory.privateKey);
            expect(btrust.delegateBySig(delegatee, nonce, expiry, v, r, s)).to.eventually.be.rejectedWith("revert BTRUST::delegateBySig: signature expired");
        });

        it('delegates on behalf of the signatory', async () => {
            const delegatee = owner, nonce = 0, expiry = 10e9;
            const signatory = web3.eth.accounts.create();
            const { v, r, s } = EIP712.sign(Domain(btrust), 'Delegation', { delegatee, nonce, expiry }, Types, signatory.privateKey);
            const tx = await btrust.delegateBySig(delegatee, nonce, expiry, v, r, s);
            expect(tx.gasUsed < 80000);
            result = await btrust.delegates(signatory.address)
            expect(result).to.equal(owner);
        });
    });

    describe('numCheckpoints', () => {
        it('returns the number of checkpoints for a delegate', async () => {
            let guy = accounts[0];
            await btrust.transfer(guy, '100', { from: owner })
            result = await btrust.numCheckpoints(a1);
            console.log(web3.utils.isBN(result))
            expect(result.toString()).to.equal('0');

            const t1 = await btrust.delegate(a1, { from: guy });
            result = await btrust.numCheckpoints(a1);
            expect(result.toString()).to.equal('1');

            const t2 = await btrust.transfer(a2, 10, { from: guy });
            result = await btrust.numCheckpoints(a1);
            expect(result.toString()).to.equal('2');

            const t3 = await btrust.transfer(a2, 10, { from: guy });
            result = await btrust.numCheckpoints(a1);
            expect(result.toString()).to.equal('3');

            const t4 = await btrust.transfer(guy, 20, { from: owner });
            result = await btrust.numCheckpoints(a1);
            expect(result.toString()).to.equal('4');

            result = await btrust.checkpoints(a1, 0);
            expect(result.fromBlock.toString()).to.equal(t1.receipt.blockNumber.toString());
            expect(result.votes.toString()).to.equal('100');

            result = await btrust.checkpoints(a1, 1);
            expect(result.fromBlock.toString()).to.equal(t2.receipt.blockNumber.toString());
            expect(result.votes.toString()).to.equal('90');

            result = await btrust.checkpoints(a1, 2);
            expect(result.fromBlock.toString()).to.equal(t3.receipt.blockNumber.toString());
            expect(result.votes.toString()).to.equal('80');

            result = await btrust.checkpoints(a1, 3);
            expect(result.fromBlock.toString()).to.equal(t4.receipt.blockNumber.toString());
            expect(result.votes.toString()).to.equal('100');
        });

        it.skip('does not add more than one checkpoint in a block', async () => {
            let guy = accounts[0];

            await btrust.transfer(guy, '100'); //give an account a few tokens for readability
            result = await btrust.numCheckpoints(a1);
            await expect(result.toString()).to.equal('0');
        
            await network.provider.send("evm_setAutomine", [false])  // result = await minerStop();

            let t1 = btrust.delegate(a1, { from: guy });
            let t2 = btrust.transfer(a2, 10, { from: guy });
            let t3 = btrust.transfer(a2, 10, { from: guy });    

            await network.provider.send("evm_setAutomine", [true]) // await minerStart();

            result = await btrust.numCheckpoints(a1);
            console.log("t0 " + result.toString())

            t1 = await t1;
            result = await btrust.numCheckpoints(a1);
            console.log("t1 " + result.toString())

            t2 = await t2;
            result = await btrust.numCheckpoints(a1);
            console.log("t2 " + result.toString())

            t3 = await t3;
            result = await btrust.numCheckpoints(a1);
            console.log("t3 " + result.toString())

            result = await btrust.numCheckpoints(a1);
            expect(result.toString()).to.equal('1');

            result = await btrust.checkpoints(a1, 0);
            expect(result.fromBlock.toString()).to.equal(t1.receipt.blockNumber.toString());
            expect(result.votes.toString()).to.equal('80');

            result = await btrust.checkpoints(a1, 1);
            expect(result.fromBlock.toString()).to.equal('0');
            expect(result.votes.toString()).to.equal('0');

            await expect(call(btrust, 'checkpoints', [a1, 0])).resolves.to.equal(expect.objectContaining({ fromBlock: t1.blockNumber.toString(), votes: '80' }));
            await expect(call(btrust, 'checkpoints', [a1, 1])).resolves.to.equal(expect.objectContaining({ fromBlock: '0', votes: '0' }));
            await expect(call(btrust, 'checkpoints', [a1, 2])).resolves.to.equal(expect.objectContaining({ fromBlock: '0', votes: '0' }));

            const t4 = await send(btrust, 'transfer', [guy, 20], { from: owner });
            await expect(call(btrust, 'numCheckpoints', [a1])).resolves.to.equal('2');
            await expect(call(btrust, 'checkpoints', [a1, 1])).resolves.to.equal(expect.objectContaining({ fromBlock: t4.blockNumber.toString(), votes: '100' }));
        });
    });

    describe('getPriorVotes', () => {
        it('reverts if block number >= current block', async () => {
            await expect(btrust.getPriorVotes(a1, 5e10)).to.eventually.be.rejectedWith("revert BTRUST::getPriorVotes: not yet determined");
        });

        it('returns 0 if there are no checkpoints', async () => {
            result = await btrust.getPriorVotes(a1, 0)
            expect(result.toString()).to.equal('0');
        });

        it('returns the latest block if >= last checkpoint block', async () => {
            const t1 = await btrust.delegate(a1, { from: owner });
            await mineBlock();
            await mineBlock();

            result = await btrust.getPriorVotes(a1, t1.receipt.blockNumber)
            expect(result.toString()).to.equal('250000000000000000000000000');

            result = await btrust.getPriorVotes(a1, t1.receipt.blockNumber + 1)
            expect(result.toString()).to.equal('250000000000000000000000000');
        });

        it('returns zero if < first checkpoint block', async () => {
            await mineBlock();
            const t1 = await btrust.delegate(a1, { from: owner });
            await mineBlock();
            await mineBlock();

            result = await btrust.getPriorVotes(a1, t1.receipt.blockNumber - 1)
            expect(result.toString()).to.equal('0');

            result = await btrust.getPriorVotes(a1, t1.receipt.blockNumber + 1)
            expect(result.toString()).to.equal('250000000000000000000000000');
        });

        it('generally returns the voting balance at the appropriate checkpoint', async () => {
            const t1 = await btrust.delegate(a1, { from: owner });
            await mineBlock();
            await mineBlock();
            const t2 = await btrust.transfer(a2, 10, { from: owner });
            await mineBlock();
            await mineBlock();
            const t3 = await btrust.transfer(a2, 10, { from: owner });
            await mineBlock();
            await mineBlock();
            const t4 = await btrust.transfer(owner, 20, { from: a2 });
            await mineBlock();
            await mineBlock();

            result = await btrust.getPriorVotes(a1, t1.receipt.blockNumber - 1);
            expect(result.toString()).to.equal('0');

            result = await btrust.getPriorVotes(a1, t1.receipt.blockNumber);
            expect(result.toString()).to.equal('250000000000000000000000000');

            result = await btrust.getPriorVotes(a1, t1.receipt.blockNumber + 1)
            expect(result.toString()).to.equal('250000000000000000000000000');

            result = await btrust.getPriorVotes(a1, t2.receipt.blockNumber);
            expect(result.toString()).to.equal('249999999999999999999999990');

            result = await btrust.getPriorVotes(a1, t2.receipt.blockNumber + 1);
            expect(result.toString()).to.equal('249999999999999999999999990');

            result = await btrust.getPriorVotes(a1, t3.receipt.blockNumber);
            expect(result.toString()).to.equal('249999999999999999999999980');

            
            result = await btrust.getPriorVotes(a1, t3.receipt.blockNumber + 1);
            expect(result.toString()).to.equal('249999999999999999999999980');

            result = await btrust.getPriorVotes(a1, t3.receipt.blockNumber + 1);
            expect(result.toString()).to.equal('249999999999999999999999980');

            result = await btrust.getPriorVotes(a1, t4.receipt.blockNumber);
            expect(result.toString()).to.equal('250000000000000000000000000');

            result = await btrust.getPriorVotes(a1, t4.receipt.blockNumber + 1);
            expect(result.toString()).to.equal('250000000000000000000000000');
        });
    });
});
