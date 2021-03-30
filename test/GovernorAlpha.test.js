const BTRUST = artifacts.require("BTRUST");
const GovernorAlpha = artifacts.require("GovernorAlpha");
require("chai")
    .use(require("chai-as-promised"))
    .expect();
const {
    address,
    etherMantissa,
    encodeParameters,
    mineBlock,
    unlockedAccount,
    blockNumber
  } = require('./Utils/Ethereum');
  const EIP712 = require('./Utils/EIP712');
  const BigNumber = require('bignumber.js');
  const chalk = require('chalk');
  
  async function enfranchise(btrust, actor, amount) {
    await btrust.transfer(actor, etherMantissa(amount));
    await btrust.delegate(actor, { from: actor });
  }
  
  describe("governorAlpha#castVote/2", () => {
    let btrust, gov, root, a1, accounts;
    let targets, values, signatures, callDatas, proposalId;
  
    before(async () => {
      [root, a1, ...accounts] = await web3.eth.getAccounts();
      btrust = await BTRUST.new(root);
      gov = await GovernorAlpha.new(address(0), btrust.address, root)
  
      targets = [a1];
      values = ["0"];
      signatures = ["getBalanceOf(address)"];
      callDatas = [encodeParameters(['address'], [a1])];
      await btrust.delegate(root);
      await gov.propose(targets, values, signatures, callDatas, "do nothing");
      proposalId = await gov.latestProposalIds(root);
    //   proposalId = proposalId.toString();
    });
  
    describe("We must revert if:", () => {
      it("There does not exist a proposal with matching proposal id where the current block number is between the proposal's start block (exclusive) and end block (inclusive)", async () => {
        expect(
          gov.castVote(proposalId, true)
        ).to.eventually.be.rejectedWith("revert GovernorAlpha::_castVote: voting is closed");
      });
  
      it("Such proposal already has an entry in its voters set matching the sender", async () => {
        await mineBlock();
        await mineBlock();
  
        await gov.castVote(proposalId, true, { from: accounts[4] });
        expect(
            gov.castVote(proposalId, true, { from: accounts[4] })
        ).to.eventually.be.rejectedWith("revert GovernorAlpha::_castVote: voter already voted");
      });
    });
  
    describe("Otherwise", () => {
        it("we add the sender to the proposal's voters set", async () => {
            mineBlock();
            
            result = await gov.getReceipt(proposalId, accounts[2])
            expect(result.hasVoted).to.be.false;

            await gov.castVote(proposalId, true, { from: accounts[2] });
            result = await gov.getReceipt(proposalId, accounts[2]);
            expect(result.hasVoted).to.be.true;
        });
  
      describe("and we take the balance returned by GetPriorVotes for the given sender and the proposal's start block, which may be zero,", () => {
        let actor; // an account that will propose, receive tokens, delegate to self, and vote on own proposal
  
        it("and we add that ForVotes", async () => {
          actor = accounts[1];
          await enfranchise(btrust, actor, 2500001);
  
          await gov.propose(targets, values, signatures, callDatas, "do nothing", { from: actor });
          proposalId = await gov.latestProposalIds(actor);
  
          let beforeFors = (await gov.proposals(proposalId)).forVotes;
          await mineBlock();
          await gov.castVote(proposalId, true, { from: actor });
  
          let afterFors = (await gov.proposals(proposalId)).forVotes;
          expect(new BigNumber(afterFors).toString()).to.equal(new BigNumber(beforeFors).plus(etherMantissa(2500001)).toString());
        })
  
        it("or AgainstVotes corresponding to the caller's support flag.", async () => {
          actor = accounts[3];
          await enfranchise(btrust, actor, 2500001);
  
          await gov.propose(targets, values, signatures, callDatas, "do nothing", { from: actor });
          proposalId = await gov.latestProposalIds(actor);
  
          let beforeAgainsts = (await gov.proposals(proposalId)).againstVotes;
          await mineBlock();
          await gov.castVote(proposalId, false, { from: actor });
  
          let afterAgainsts = (await gov.proposals(proposalId)).againstVotes;
          expect(new BigNumber(afterAgainsts).toString()).to.equal(new BigNumber(beforeAgainsts).plus(etherMantissa(2500001)).toString());
        });
      });
  
      describe('castVoteBySig', () => {
        const Domain = (gov) => ({
          name: 'BTRUST Governor Alpha',
          chainId: 1, // await web3.eth.net.getId(); See: https://github.com/trufflesuite/ganache-core/issues/515
          verifyingContract: gov.address
        });
        const Types = {
          Ballot: [
            { name: 'proposalId', type: 'uint256' },
            { name: 'support', type: 'bool' }
          ]
        };
  
        it('reverts if the signatory is invalid', async () => {
            expect(gov.castVoteBySig(proposalId, false, 0, '0xbad', '0xbad')).to.eventually.be.rejectedWith("revert GovernorAlpha::castVoteBySig: invalid signature");
        });
  
        it.skip('casts vote on behalf of the signatory', async () => {
            const signatory = web3.eth.accounts.create();
            console.log(signatory.address)
            console.log(a1.privateKey)

          await enfranchise(btrust, signatory.address, 400001);
          await gov.propose(targets, values, signatures, callDatas, "do nothing", { from: signatory.address });
          proposalId = await gov.latestProposalIds(signatory.address);;
  
          const { v, r, s } = EIP712.sign(Domain(gov), 'Ballot', { proposalId, support: true }, Types, signatory.privateKey);
  
          let beforeFors = (await gov.proposals(proposalId)).forVotes;
          await mineBlock();
          const tx = await gov.castVoteBySig(proposalId, true, v, r, s);
          expect(tx.gasUsed < 80000);
  
          let afterFors = (await gov.proposals(proposalId)).forVotes;
          expect(new BigNumber(afterFors).toString()).to.equal(new BigNumber(beforeFors).plus(etherMantissa(400001)).toString());
        });
      });
  
      it.skip("receipt uses one load", async () => {
        let actor = accounts[2];
        let actor2 = accounts[3];
        await enfranchise(btrust, actor, 400001);
        await enfranchise(btrust, actor2, 400001);
        await gov.propose(targets, values, signatures, callDatas, "do nothing", { from: actor });
        proposalId = await gov.latestProposalIds(actor);;

  
        await mineBlock();
        await mineBlock();
        await gov.castVote(proposalId, true, { from: actor });
        await gov.castVote(proposalId, false, { from: actor2 });

  
        let trxReceipt = await gov.getReceipt(proposalId, actor);
        let trxReceipt2 = await gov.getReceipt(proposalId, actor2);

  
        await saddle.trace(trxReceipt, {
          constants: {
            "account": actor
          },
          preFilter: ({op}) => op === 'SLOAD',
          postFilter: ({source}) => !source || source.includes('receipts'),
          execLog: (log) => {
            let [output] = log.outputs;
            let votes = "000000000000000000000000000000000000000054b419003bdf81640000";
            let voted = "01";
            let support = "01";
  
            expect(output).toEqual(
              `${votes}${support}${voted}`
            );
          },
          exec: (logs) => {
            expect(logs.length).toEqual(1); // require only one read
          }
        });
  
        await saddle.trace(trxReceipt2, {
          constants: {
            "account": actor2
          },
          preFilter: ({op}) => op === 'SLOAD',
          postFilter: ({source}) => !source || source.includes('receipts'),
          execLog: (log) => {
            let [output] = log.outputs;
            let votes = "0000000000000000000000000000000000000000a968320077bf02c80000";
            let voted = "01";
            let support = "00";
  
            expect(output).toEqual(
              `${votes}${support}${voted}`
            );
          }
        });
      });
    });
  });
  
  describe('GovernorAlpha#propose/5', () => {
    let gov, root, acct;
  
    before(async () => {
        [root, acct, ...accounts] = await web3.eth.getAccounts();
        btrust = await BTRUST.new(root);
        gov = await GovernorAlpha.new(address(0), btrust.address, address(0))
    });
  
    let trivialProposal, targets, values, signatures, callDatas;
    let proposalBlock;
    before(async () => {
      targets = [root];
      values = ["0"];
      signatures = ["getBalanceOf(address)"];
      callDatas = [encodeParameters(['address'], [acct])];
      await btrust.delegate(root);
      await gov.propose(targets, values, signatures, callDatas, "do nothing");
      proposalBlock = +(await web3.eth.getBlockNumber());
      proposalId = await gov.latestProposalIds(root);
      trivialProposal = await gov.proposals(proposalId);
    });
  
    // it("Given the sender's GetPriorVotes for the immediately previous block is above the Proposal Threshold (e.g. 2%), the given proposal is added to all proposals, given the following settings", async () => {
    //   test.todo('depends on get prior votes and delegation and voting');
    // });
  
    describe("simple initialization", () => {
      it("ID is set to a globally unique identifier", async () => {
        expect(trivialProposal.id.toString()).to.equal(proposalId.toString());
      });
  
      it("Proposer is set to the sender", async () => {
        expect(trivialProposal.proposer.toString()).to.equal(root);
      });
  
      it("Start block is set to the current block number plus vote delay", async () => {
        expect(trivialProposal.startBlock.toString()).to.equal(proposalBlock + 1 + "");
      });
  
      it("End block is set to the current block number plus the sum of vote delay and vote period", async () => {
        expect(trivialProposal.endBlock.toString()).to.equal(proposalBlock + 1 + 17280 + "");
      });
  
      it("ForVotes and AgainstVotes are initialized to zero", async () => {
        expect(trivialProposal.forVotes.toString()).to.equal("0");
        expect(trivialProposal.againstVotes.toString()).to.equal("0");
      });
  
      xit("Voters is initialized to the empty set", async () => {
        test.todo('mmm probably nothing to prove here unless we add a counter or something');
      });
  
      it("Executed and Canceled flags are initialized to false", async () => {
        expect(trivialProposal.canceled).to.be.false;
        expect(trivialProposal.executed).to.be.false;
      });
  
      it("ETA is initialized to zero", async () => {
        expect(trivialProposal.eta.toString()).to.equal("0");
      });
  
      it("Targets, Values, Signatures, Calldatas are set according to parameters", async () => {
        let dynamicFields = await gov.getActions(trivialProposal.id);
        expect(dynamicFields.targets).to.deep.equal(targets);
        expect(dynamicFields.values[0].toString()).to.equal(values[0]);
        expect(dynamicFields.signatures).to.deep.equal(signatures);
        expect(dynamicFields.calldatas).to.deep.equal(callDatas);
      });
  
      describe("This function must revert if", () => {
        it("the length of the values, signatures or calldatas arrays are not the same length,", async () => {
          expect(
            gov.propose(targets.concat(root), values, signatures, callDatas, "do nothing")
          ).to.eventually.be.rejectedWith("revert GovernorAlpha::propose: proposal function information arity mismatch");
  
          expect(
            gov.propose(targets, values.concat(values), signatures, callDatas, "do nothing")
          ).to.eventually.be.rejectedWith("revert GovernorAlpha::propose: proposal function information arity mismatch");
  
          expect(
            gov.propose(targets, values, signatures.concat(signatures), callDatas, "do nothing")
          ).to.eventually.be.rejectedWith("revert GovernorAlpha::propose: proposal function information arity mismatch");
  
          expect(
            gov.propose(targets, values, signatures, callDatas.concat(callDatas), "do nothing")
          ).to.eventually.be.rejectedWith("revert GovernorAlpha::propose: proposal function information arity mismatch");
        });
  
        it("or if that length is zero or greater than Max Operations.", async () => {
          expect(
            gov.propose([], [], [], [], "do nothing")
          ).to.eventually.be.rejectedWith("revert GovernorAlpha::propose: must provide actions");
        });
  
        describe("Additionally, if there exists a pending or active proposal from the same proposer, we must revert.", () => {
          it("reverts with pending", async () => {
            expect(
              gov.propose(targets, values, signatures, callDatas, "do nothing")
            ).to.eventually.be.rejectedWith("revert GovernorAlpha::propose: one live proposal per proposer, found an already pending proposal");
          });
  
          it("reverts with active", async () => {
            await mineBlock();
            await mineBlock();
  
            expect(
              gov.propose(targets, values, signatures, callDatas, "do nothing")
            ).to.eventually.be.rejectedWith("revert GovernorAlpha::propose: one live proposal per proposer, found an already active proposal");
          });
        });
      });
  
      it.skip("This function returns the id of the newly created proposal. # proposalId(n) = succ(proposalId(n-1))", async () => {
        await btrust.transfer(accounts[2], etherMantissa(400001));
        await btrust.delegate(accounts[2], { from: accounts[2] });
  
        await mineBlock();
        let nextProposalId = await gov.propose(targets, values, signatures, callDatas, "yoot", { from: accounts[2] });
        // let nextProposalId = await call(gov, 'propose', [targets, values, signatures, callDatas, "second proposal"], { from: accounts[2] });
        expect(nextProposalId.toString()).to.equal(trivialProposal.id + 1);
      });
  
      it.skip("emits log with id and description", async () => {
        await send(btrust, 'transfer', [accounts[3], etherMantissa(400001)]);
        await send(btrust, 'delegate', [accounts[3]], { from: accounts[3] });
        await mineBlock();
        let nextProposalId = await gov.methods['propose'](targets, values, signatures, callDatas, "yoot").call({ from: accounts[3] });
  
        expect(
          await send(gov, 'propose', [targets, values, signatures, callDatas, "second proposal"], { from: accounts[3] })
        ).toHaveLog("ProposalCreated", {
          id: nextProposalId,
          targets: targets,
          values: values,
          signatures: signatures,
          calldatas: callDatas,
          startBlock: 14,
          endBlock: 17294,
          description: "second proposal",
          proposer: accounts[3]
        });
      });
    });
  });
  