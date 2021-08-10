const BTRST = artifacts.require("BTRST");
const GovernorAlpha = artifacts.require("GovernorAlpha");
const TimelockHarness = artifacts.require("TimelockHarness")
require("chai")
    .use(require("chai-as-promised"))
    .expect();
const {
    address,
    etherMantissa,
    encodeParameters,
    mineBlock,
    unlockedAccount,
    blockNumber,
    advanceBlocks,
    freezeTime
  } = require('./Utils/Ethereum');
  const EIP712 = require('./Utils/EIP712');
  const BigNumber = require('bignumber.js');
  const chalk = require('chalk');
  const path = require('path');
  const solparse = require('solparse');
  
  async function enfranchise(btrust, actor, amount) {
    await btrust.transfer(actor, etherMantissa(amount));
    await btrust.delegate(actor, { from: actor });
  }
  
  describe("governorAlpha", () => {
    let gov;
    let quorumVotes = new BigNumber(45000000e18);
    let proposalThreshold = BigNumber(55000e18);
    let votingPeriod = 30000;

    it('sets variables during initialization', async () => {
      gov = await GovernorAlpha.new(address(0), address(0), address(0), quorumVotes, proposalThreshold, votingPeriod);

      expect(BigNumber(await gov.quorumVotes()).toString()).to.equal(quorumVotes.toString());
      expect(BigNumber(await gov.proposalThreshold()).toString()).to.equal(proposalThreshold.toString());
      expect((await gov.votingPeriod()).toString()).to.equal(votingPeriod.toString());
    });
  });

  describe("governorAlpha#castVote/2", () => {
    let btrust, gov, root, a1, accounts;
    let targets, values, signatures, callDatas, proposalId;
    let quorumVotes = BigNumber(25000000e18);
    let proposalThreshold = BigNumber(2500000e18);
    let votingPeriod = 17280;
  
    before(async () => {
      [root, a1, ...accounts] = await web3.eth.getAccounts();
      btrust = await BTRST.new(root);
      gov = await GovernorAlpha.new(address(0), btrust.address, root, quorumVotes, proposalThreshold, votingPeriod)
  
      targets = [a1];
      values = ["0"];
      signatures = ["getBalanceOf(address)"];
      callDatas = [encodeParameters(['address'], [a1])];
      await btrust.delegate(root);
      await gov.propose(targets, values, signatures, callDatas, "do nothing");
      proposalId = await gov.latestProposalIds(root);
    });
  
    describe("We must revert if:", () => {
      it("There does not exist a proposal with matching proposal id where the current block number is between the proposal's start block (exclusive) and end block (inclusive)", async () => {
        return expect(
          gov.castVote(proposalId, true)
        ).to.be.rejectedWith("revert GovernorAlpha::_castVote: voting is closed");
      });
  
      it("Such proposal already has an entry in its voters set matching the sender", async () => {
        await mineBlock();
        await mineBlock();
  
        await gov.castVote(proposalId, true, { from: accounts[4] });
        return expect(
            gov.castVote(proposalId, true, { from: accounts[4] })
        ).to.be.rejectedWith("revert GovernorAlpha::_castVote: voter already voted");
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
          name: 'BTRST Governor Alpha',
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
            return expect(gov.castVoteBySig(proposalId, false, 0, '0xbad', '0xbad')).to.be.rejectedWith("revert GovernorAlpha::castVoteBySig: invalid signature");
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
    let quorumVotes = BigNumber(25000000e18);
    let proposalThreshold = BigNumber(2500000e18);
    let votingPeriod = 17280;
  
    before(async () => {
        [root, acct, ...accounts] = await web3.eth.getAccounts();
        btrust = await BTRST.new(root);
        gov = await GovernorAlpha.new(address(0), btrust.address, address(0), quorumVotes, proposalThreshold, votingPeriod)
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
        it.skip("the length of the values, signatures or calldatas arrays are not the same length,", async () => {
          expect(
            gov.propose(targets.concat(root), values, signatures, callDatas, "do nothing")
          ).to.be.rejectedWith("revert GovernorAlpha::propose: proposal function information arity mismatch").notify(done);
  
          expect(
            gov.propose(targets, values.concat(values), signatures, callDatas, "do nothing")
          ).to.be.rejectedWith("revert GovernorAlpha::propose: proposal function information arity mismatch").notify(done);
  
          expect(
            gov.propose(targets, values, signatures.concat(signatures), callDatas, "do nothing")
          ).to.be.rejectedWith("revert GovernorAlpha::propose: proposal function information arity mismatch").notify(done);
  
          expect(
            gov.propose(targets, values, signatures, callDatas.concat(callDatas), "do nothing")
          ).to.be.rejectedWith("revert GovernorAlpha::propose: proposal function information arity mismatch").notify(done);
        });
  
        it("or if that length is zero or greater than Max Operations.", async () => {
          return expect(
            gov.propose([], [], [], [], "do nothing")
          ).to.be.rejectedWith("revert GovernorAlpha::propose: must provide actions");
        });
  
        describe("Additionally, if there exists a pending or active proposal from the same proposer, we must revert.", () => {
          it.skip("reverts with pending", async () => {
            return expect(
              gov.propose(targets, values, signatures, callDatas, "do nothing")
            ).to.be.rejectedWith("VM Exception while processing transaction: revert GovernorAlpha::propose: one live proposal per proposer, found an already pending proposal");
          });
  
          it("reverts with active", async () => {
            await mineBlock();
            await mineBlock();
  
            return expect(
              gov.propose(targets, values, signatures, callDatas, "do nothing")
            ).to.be.rejectedWith("VM Exception while processing transaction: revert GovernorAlpha::propose: one live proposal per proposer, found an already active proposal");
          });
        });
      });
  
      it.skip("This function returns the id of the newly created proposal. # proposalId(n) = succ(proposalId(n-1))", async () => {
        await btrust.transfer(accounts[2], etherMantissa(400001));
        await btrust.delegate(accounts[2], { from: accounts[2] });
  
        await mineBlock();
        let nextProposalId = await gov.propose(targets, values, signatures, callDatas, "yoot", { from: accounts[2] });
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
  
  describe('GovernorAlpha#queue/1', () => {
    let root, a1, a2, accounts;
    let quorumVotes = BigNumber(25000000e18);
    let proposalThreshold = BigNumber(2500000e18);
    let votingPeriod = 17280;
    before(async () => {
      [root, a1, a2, ...accounts] = await web3.eth.getAccounts();
    });
  
    describe("overlapping actions", () => {
      it.skip("reverts on queueing overlapping actions in same proposal", async () => {
        const timelock = await TimelockHarness.new(root, 86400 * 2);
        const btrust = await BTRST.new(root);
        const gov = await GovernorAlpha.new(timelock.address, btrust.address, root, quorumVotes, proposalThreshold, votingPeriod);
        const txAdmin = await timelock.harnessSetAdmin(gov.address);
  
        await enfranchise(btrust, a1, 3e6);
        await mineBlock();
  
        const targets = [btrust.address, btrust.address];
        const values = ["0", "0"];
        const signatures = ["getBalanceOf(address)", "getBalanceOf(address)"];
        const calldatas = [encodeParameters(['address'], [root]), encodeParameters(['address'], [root])];
        await gov.propose(targets, values, signatures, calldatas, "do nothing", {from: a1});
        proposalId1 = await gov.latestProposalIds(a1);
        await mineBlock();
  
        const txVote1 = await gov.castVote(proposalId1.toString(), true, {from: a1});
        await advanceBlocks(20000);
  
        return expect(
          gov.queue(proposalId1.toString())
        ).to.be.rejectedWith("revert GovernorAlpha::_queueOrRevert: proposal action already queued at eta");
      });
  
      it.skip("reverts on queueing overlapping actions in different proposals, works if waiting", async () => {
        const timelock = await TimelockHarness.new(root, 86400 * 2);
        const btrust = await BTRST.new(root);
        const gov = await GovernorAlpha.new(timelock.address, btrust.address, root, quorumVotes, proposalThreshold, votingPeriod);
        const txAdmin = await timelock.harnessSetAdmin(gov.address);
  
        await enfranchise(btrust, a1, 3e6);
        await enfranchise(btrust, a2, 3e6);
        await mineBlock();
  
        const targets = [btrust.address];
        const values = ["0"];
        const signatures = ["getBalanceOf(address)"];
        const calldatas = [encodeParameters(['address'], [root])];
        await gov.propose(targets, values, signatures, calldatas, "do nothing", {from: a1});
        await gov.propose(targets, values, signatures, calldatas, "do nothing", {from: a2});
        proposalId1 = (await gov.latestProposalIds(a1)).toString();
        proposalId2 = (await gov.latestProposalIds(a2)).toString();
        await mineBlock();
  
        const txVote1 = await gov.castVote(proposalId1, true, {from: a1});
        const txVote2 = await gov.castVote(proposalId2, true, {from: a2});
        await advanceBlocks(20000);
        await freezeTime(2000000000);
  
        const txQueue1 = await gov.queue(proposalId1);
        await expect(
          gov.queue(proposalId2)
        ).to.be.rejectedWith("revert GovernorAlpha::_queueOrRevert: proposal action already queued at eta").notify(done);
  
        await freezeTime(2000000001);
        const txQueue2 = await gov.queue(proposalId2);
      });
    });
  
  const governorAlphaPath = path.join(__dirname, '../', 'contracts', '/GovernorAlpha.sol');
  
  const statesInverted = solparse
    .parseFile(governorAlphaPath)
    .body
    .find(k => k.type === 'ContractStatement')
    .body
    .find(k => k.name == 'ProposalState')
    .members
  
  const states = Object.entries(statesInverted).reduce((obj, [key, value]) => ({ ...obj, [value]: key }), {});
  
  describe.skip('GovernorAlpha#state/1', () => {
    let btrust, gov, root, acct, delay, timelock;
  
    before(async () => {
      await freezeTime(100);
      [root, acct, ...accounts] = accounts;
      btrust = await deploy('btrust', [root]);
      delay = etherUnsigned(2 * 24 * 60 * 60).multipliedBy(2)
      timelock = await deploy('TimelockHarness', [root, delay]);
      gov = await deploy('GovernorAlpha', [timelock._address, btrust._address, root]);
      await send(timelock, "harnessSetAdmin", [gov._address])
      await send(btrust, 'transfer', [acct, etherMantissa(4000000)]);
      await send(btrust, 'delegate', [acct], { from: acct });
    });
  
    let trivialProposal, targets, values, signatures, callDatas;
    before(async () => {
      targets = [root];
      values = ["0"];
      signatures = ["getBalanceOf(address)"]
      callDatas = [encodeParameters(['address'], [acct])];
      await send(btrust, 'delegate', [root]);
      await send(gov, 'propose', [targets, values, signatures, callDatas, "do nothing"]);
      proposalId = await call(gov, 'latestProposalIds', [root]);
      trivialProposal = await call(gov, "proposals", [proposalId])
    })
  
    it("Invalid for proposal not found", async () => {
      await expect(call(gov, 'state', ["5"])).rejects.toRevert("revert GovernorAlpha::state: invalid proposal id")
    })
  
    it("Pending", async () => {
      expect(await call(gov, 'state', [trivialProposal.id], {})).toEqual(states["Pending"])
    })
  
    it("Active", async () => {
      await mineBlock()
      await mineBlock()
      expect(await call(gov, 'state', [trivialProposal.id], {})).toEqual(states["Active"])
    })
  
    it("Canceled", async () => {
      await send(btrust, 'transfer', [accounts[0], etherMantissa(4000000)]);
      await send(btrust, 'delegate', [accounts[0]], { from: accounts[0] });
      await mineBlock()
      await send(gov, 'propose', [targets, values, signatures, callDatas, "do nothing"], { from: accounts[0] })
      let newProposalId = await call(gov, 'proposalCount')
  
      // send away the delegates
      await send(btrust, 'delegate', [root], { from: accounts[0] });
      await send(gov, 'cancel', [newProposalId])
  
      expect(await call(gov, 'state', [+newProposalId])).toEqual(states["Canceled"])
    })
  
    it("Defeated", async () => {
      // travel to end block
      await advanceBlocks(20000)
  
      expect(await call(gov, 'state', [trivialProposal.id])).toEqual(states["Defeated"])
    })
  
    it("Succeeded", async () => {
      await mineBlock()
      const { reply: newProposalId } = await both(gov, 'propose', [targets, values, signatures, callDatas, "do nothing"], { from: acct })
      await mineBlock()
      await send(gov, 'castVote', [newProposalId, true])
      await advanceBlocks(20000)
  
      expect(await call(gov, 'state', [newProposalId])).toEqual(states["Succeeded"])
    })
  
    it("Queued", async () => {
      await mineBlock()
      const { reply: newProposalId } = await both(gov, 'propose', [targets, values, signatures, callDatas, "do nothing"], { from: acct })
      await mineBlock()
      await send(gov, 'castVote', [newProposalId, true])
      await advanceBlocks(20000)
  
      await send(gov, 'queue', [newProposalId], { from: acct })
      expect(await call(gov, 'state', [newProposalId])).toEqual(states["Queued"])
    })
  
    it("Expired", async () => {
      await mineBlock()
      const { reply: newProposalId } = await both(gov, 'propose', [targets, values, signatures, callDatas, "do nothing"], { from: acct })
      await mineBlock()
      await send(gov, 'castVote', [newProposalId, true])
      await advanceBlocks(20000)
  
      await increaseTime(1)
      await send(gov, 'queue', [newProposalId], { from: acct })
  
      let gracePeriod = await call(timelock, 'GRACE_PERIOD')
      let p = await call(gov, "proposals", [newProposalId]);
      let eta = etherUnsigned(p.eta)
  
      await freezeTime(eta.plus(gracePeriod).minus(1).toNumber())
  
      expect(await call(gov, 'state', [newProposalId])).toEqual(states["Queued"])
  
      await freezeTime(eta.plus(gracePeriod).toNumber())
  
      expect(await call(gov, 'state', [newProposalId])).toEqual(states["Expired"])
    })
  
    it("Executed", async () => {
      await mineBlock()
      const { reply: newProposalId } = await both(gov, 'propose', [targets, values, signatures, callDatas, "do nothing"], { from: acct })
      await mineBlock()
      await send(gov, 'castVote', [newProposalId, true])
      await advanceBlocks(20000)
  
      await increaseTime(1)
      await send(gov, 'queue', [newProposalId], { from: acct })
  
      let gracePeriod = await call(timelock, 'GRACE_PERIOD')
      let p = await call(gov, "proposals", [newProposalId]);
      let eta = etherUnsigned(p.eta)
  
      await freezeTime(eta.plus(gracePeriod).minus(1).toNumber())
  
      expect(await call(gov, 'state', [newProposalId])).toEqual(states["Queued"])
      await send(gov, 'execute', [newProposalId], { from: acct })
  
      expect(await call(gov, 'state', [newProposalId])).toEqual(states["Executed"])
  
      // still executed even though would be expired
      await freezeTime(eta.plus(gracePeriod).toNumber())
  
      expect(await call(gov, 'state', [newProposalId])).toEqual(states["Executed"])
    })
  })
})
  