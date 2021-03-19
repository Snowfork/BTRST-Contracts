Timelock = artifacts.require("Timelock")
const {
    encodeParameters,
    etherUnsigned,
    freezeTime,
    keccak256
  } = require('./Utils/Ethereum');
require("chai")
  .use(require("chai-as-promised"))
  .expect();
  
  const oneWeekInSeconds = etherUnsigned(7 * 24 * 60 * 60);
  const zero = etherUnsigned(0);
  const gracePeriod = oneWeekInSeconds.multipliedBy(2);
  
  describe('Timelock', () => {
    let root, notAdmin, newAdmin;
    let blockTimestamp;
    let timelock;
    let delay = oneWeekInSeconds;
    let newDelay = delay.multipliedBy(2);
    let target;
    let value = zero;
    let signature = 'setDelay(uint256)';
    let data = encodeParameters(['uint256'], [newDelay.toFixed()]);
    let revertData = encodeParameters(['uint256'], [etherUnsigned(60 * 60).toFixed()]);
    let eta;
    let queuedTxHash;
  
    beforeEach(async () => {
      [root, notAdmin, newAdmin] = await web3.eth.getAccounts();
      timelock = await Timelock.new(root, delay);
  
      blockTimestamp = etherUnsigned(100);
      await freezeTime(blockTimestamp.toNumber())
      target = timelock.address;
      eta = blockTimestamp.plus(delay);
  
      queuedTxHash = keccak256(
        encodeParameters(
          ['address', 'uint256', 'string', 'bytes', 'uint256'],
          [target, value.toString(), signature, data, eta.toString()]
        )
      );
    });
  
    describe('constructor', () => {
      it('sets address of admin', async () => {
        let configuredAdmin = await timelock.admin();
        expect(configuredAdmin).to.equal(root);
      });
  
      it('sets delay', async () => {
        let configuredDelay = await timelock.delay();
        expect(configuredDelay.toString()).to.equal(delay.toString());
      });
    });
  
    describe('setDelay', () => {
      it('requires msg.sender to be Timelock', async () => {
        expect(timelock.setDelay(delay, { from: root })).to.eventually.be.rejectedWith('revert Timelock::setDelay: Call must come from Timelock.');
      });
    });
  
    describe('setPendingAdmin', () => {
      it('requires msg.sender to be Timelock', async () => {
        expect(
          timelock.setPendingAdmin(newAdmin, { from: root })
        ).to.eventually.be.rejectedWith('revert Timelock::setPendingAdmin: Call must come from Timelock.');
      });
    });
  
    describe.skip('acceptAdmin', () => {
      afterEach(async () => {
        await send(timelock, 'harnessSetAdmin', [root], { from: root });
      });
  
      it('requires msg.sender to be pendingAdmin', async () => {
        await expect(
          send(timelock, 'acceptAdmin', { from: notAdmin })
        ).rejects.toRevert('revert Timelock::acceptAdmin: Call must come from pendingAdmin.');
      });
  
      it('sets pendingAdmin to address 0 and changes admin', async () => {
        await send(timelock, 'harnessSetPendingAdmin', [newAdmin], { from: root });
        const pendingAdminBefore = await call(timelock, 'pendingAdmin');
        expect(pendingAdminBefore).toEqual(newAdmin);
  
        const result = await send(timelock, 'acceptAdmin', { from: newAdmin });
        const pendingAdminAfter = await call(timelock, 'pendingAdmin');
        expect(pendingAdminAfter).toEqual('0x0000000000000000000000000000000000000000');
  
        const timelockAdmin = await call(timelock, 'admin');
        expect(timelockAdmin).toEqual(newAdmin);
  
        expect(result).toHaveLog('NewAdmin', {
          newAdmin
        });
      });
    });
  
    describe('queueTransaction', () => {
      it('requires admin to be msg.sender', async () => {
        expect(
          timelock.queueTransaction(target, value, signature, data, eta, { from: notAdmin })
        ).to.eventually.be.rejectedWith('revert Timelock::queueTransaction: Call must come from admin.');
      });
  
      it('requires eta to exceed delay', async () => {
        const etaLessThanDelay = blockTimestamp.plus(delay).minus(1);
  
        expect(
          timelock.queueTransaction(target, value, signature, data, etaLessThanDelay, { from: root})
        ).to.eventually.be.rejectedWith('revert Timelock::queueTransaction: Estimated execution block must satisfy delay.');
      });
  
      it.skip('sets hash as true in queuedTransactions mapping', async () => {
        const queueTransactionsHashValueBefore = await timelock.queuedTransactions(queuedTxHash);
        expect(queueTransactionsHashValueBefore).to.be.false;
  
        await timelock.queueTransaction(target, value, signature, data, eta, { from: root });
  
        const queueTransactionsHashValueAfter = await timelock.queuedTransactions(queuedTxHash);
        expect(queueTransactionsHashValueAfter).to.be.true;
      });
  
      it.skip('should emit QueueTransaction event', async () => {
        const result = await send(timelock, 'queueTransaction', [target, value, signature, data, eta], {
          from: root
        });
  
        expect(result).toHaveLog('QueueTransaction', {
          data,
          signature,
          target,
          eta: eta.toString(),
          txHash: queuedTxHash,
          value: value.toString()
        });
      });
    });
  
    describe.skip('cancelTransaction', () => {
      beforeEach(async () => {
        await send(timelock, 'queueTransaction', [target, value, signature, data, eta], { from: root });
      });
  
      it('requires admin to be msg.sender', async () => {
        await expect(
          send(timelock, 'cancelTransaction', [target, value, signature, data, eta], { from: notAdmin })
        ).rejects.toRevert('revert Timelock::cancelTransaction: Call must come from admin.');
      });
  
      it('sets hash from true to false in queuedTransactions mapping', async () => {
        const queueTransactionsHashValueBefore = await call(timelock, 'queuedTransactions', [queuedTxHash]);
        expect(queueTransactionsHashValueBefore).toEqual(true);
  
        await send(timelock, 'cancelTransaction', [target, value, signature, data, eta], { from: root });
  
        const queueTransactionsHashValueAfter = await call(timelock, 'queuedTransactions', [queuedTxHash]);
        expect(queueTransactionsHashValueAfter).toEqual(false);
      });
  
      it('should emit CancelTransaction event', async () => {
        const result = await send(timelock, 'cancelTransaction', [target, value, signature, data, eta], {
          from: root
        });
  
        expect(result).toHaveLog('CancelTransaction', {
          data,
          signature,
          target,
          eta: eta.toString(),
          txHash: queuedTxHash,
          value: value.toString()
        });
      });
    });
  
    describe.skip('queue and cancel empty', () => {
      it('can queue and cancel an empty signature and data', async () => {
        const txHash = keccak256(
          encodeParameters(
            ['address', 'uint256', 'string', 'bytes', 'uint256'],
            [target, value.toString(), '', '0x', eta.toString()]
          )
        );
        expect(await call(timelock, 'queuedTransactions', [txHash])).toBeFalsy();
        await send(timelock, 'queueTransaction', [target, value, '', '0x', eta], { from: root });
        expect(await call(timelock, 'queuedTransactions', [txHash])).toBeTruthy();
        await send(timelock, 'cancelTransaction', [target, value, '', '0x', eta], { from: root });
        expect(await call(timelock, 'queuedTransactions', [txHash])).toBeFalsy();
      });
    });
  
    describe.skip('executeTransaction (setDelay)', () => {
      beforeEach(async () => {
        // Queue transaction that will succeed
        await send(timelock, 'queueTransaction', [target, value, signature, data, eta], {
          from: root
        });
  
        // Queue transaction that will revert when executed
        await send(timelock, 'queueTransaction', [target, value, signature, revertData, eta], {
          from: root
        });
      });
  
      it('requires admin to be msg.sender', async () => {
        await expect(
          send(timelock, 'executeTransaction', [target, value, signature, data, eta], { from: notAdmin })
        ).rejects.toRevert('revert Timelock::executeTransaction: Call must come from admin.');
      });
  
      it('requires transaction to be queued', async () => {
        const differentEta = eta.plus(1);
        await expect(
          send(timelock, 'executeTransaction', [target, value, signature, data, differentEta], { from: root })
        ).rejects.toRevert("revert Timelock::executeTransaction: Transaction hasn't been queued.");
      });
  
      it('requires timestamp to be greater than or equal to eta', async () => {
        await expect(
          send(timelock, 'executeTransaction', [target, value, signature, data, eta], {
            from: root
          })
        ).rejects.toRevert(
          "revert Timelock::executeTransaction: Transaction hasn't surpassed time lock."
        );
      });
  
      it('requires timestamp to be less than eta plus gracePeriod', async () => {
        await freezeTime(blockTimestamp.plus(delay).plus(gracePeriod).plus(1).toNumber());
  
        await expect(
          send(timelock, 'executeTransaction', [target, value, signature, data, eta], {
            from: root
          })
        ).rejects.toRevert('revert Timelock::executeTransaction: Transaction is stale.');
      });
  
      it('requires target.call transaction to succeed', async () => {
        await freezeTime(eta.toNumber());
  
        await expect(
          send(timelock, 'executeTransaction', [target, value, signature, revertData, eta], {
            from: root
          })
        ).rejects.toRevert('revert Timelock::executeTransaction: Transaction execution reverted.');
      });
  
      it('sets hash from true to false in queuedTransactions mapping, updates delay, and emits ExecuteTransaction event', async () => {
        const configuredDelayBefore = await call(timelock, 'delay');
        expect(configuredDelayBefore).toEqual(delay.toString());
  
        const queueTransactionsHashValueBefore = await call(timelock, 'queuedTransactions', [queuedTxHash]);
        expect(queueTransactionsHashValueBefore).toEqual(true);
  
        const newBlockTimestamp = blockTimestamp.plus(delay).plus(1);
        await freezeTime(newBlockTimestamp.toNumber());
  
        const result = await send(timelock, 'executeTransaction', [target, value, signature, data, eta], {
          from: root
        });
  
        const queueTransactionsHashValueAfter = await call(timelock, 'queuedTransactions', [queuedTxHash]);
        expect(queueTransactionsHashValueAfter).toEqual(false);
  
        const configuredDelayAfter = await call(timelock, 'delay');
        expect(configuredDelayAfter).toEqual(newDelay.toString());
  
        expect(result).toHaveLog('ExecuteTransaction', {
          data,
          signature,
          target,
          eta: eta.toString(),
          txHash: queuedTxHash,
          value: value.toString()
        });
  
        expect(result).toHaveLog('NewDelay', {
          newDelay: newDelay.toString()
        });
      });
    });
  
    describe.skip('executeTransaction (setPendingAdmin)', () => {
      beforeEach(async () => {
        const configuredDelay = await call(timelock, 'delay');
  
        delay = etherUnsigned(configuredDelay);
        signature = 'setPendingAdmin(address)';
        data = encodeParameters(['address'], [newAdmin]);
        eta = blockTimestamp.plus(delay);
  
        queuedTxHash = keccak256(
          encodeParameters(
            ['address', 'uint256', 'string', 'bytes', 'uint256'],
            [target, value.toString(), signature, data, eta.toString()]
          )
        );
  
        await send(timelock, 'queueTransaction', [target, value, signature, data, eta], {
          from: root
        });
      });
  
      it('requires admin to be msg.sender', async () => {
        await expect(
          send(timelock, 'executeTransaction', [target, value, signature, data, eta], { from: notAdmin })
        ).rejects.toRevert('revert Timelock::executeTransaction: Call must come from admin.');
      });
  
      it('requires transaction to be queued', async () => {
        const differentEta = eta.plus(1);
        await expect(
          send(timelock, 'executeTransaction', [target, value, signature, data, differentEta], { from: root })
        ).rejects.toRevert("revert Timelock::executeTransaction: Transaction hasn't been queued.");
      });
  
      it('requires timestamp to be greater than or equal to eta', async () => {
        await expect(
          send(timelock, 'executeTransaction', [target, value, signature, data, eta], {
            from: root
          })
        ).rejects.toRevert(
          "revert Timelock::executeTransaction: Transaction hasn't surpassed time lock."
        );
      });
  
      it('requires timestamp to be less than eta plus gracePeriod', async () => {
        await freezeTime(blockTimestamp.plus(delay).plus(gracePeriod).plus(1).toNumber());
  
        await expect(
          send(timelock, 'executeTransaction', [target, value, signature, data, eta], {
            from: root
          })
        ).rejects.toRevert('revert Timelock::executeTransaction: Transaction is stale.');
      });
  
      it('sets hash from true to false in queuedTransactions mapping, updates admin, and emits ExecuteTransaction event', async () => {
        const configuredPendingAdminBefore = await call(timelock, 'pendingAdmin');
        expect(configuredPendingAdminBefore).toEqual('0x0000000000000000000000000000000000000000');
  
        const queueTransactionsHashValueBefore = await call(timelock, 'queuedTransactions', [queuedTxHash]);
        expect(queueTransactionsHashValueBefore).toEqual(true);
  
        const newBlockTimestamp = blockTimestamp.plus(delay).plus(1);
        await freezeTime(newBlockTimestamp.toNumber())
  
        const result = await send(timelock, 'executeTransaction', [target, value, signature, data, eta], {
          from: root
        });
  
        const queueTransactionsHashValueAfter = await call(timelock, 'queuedTransactions', [queuedTxHash]);
        expect(queueTransactionsHashValueAfter).toEqual(false);
  
        const configuredPendingAdminAfter = await call(timelock, 'pendingAdmin');
        expect(configuredPendingAdminAfter).toEqual(newAdmin);
  
        expect(result).toHaveLog('ExecuteTransaction', {
          data,
          signature,
          target,
          eta: eta.toString(),
          txHash: queuedTxHash,
          value: value.toString()
        });
  
        expect(result).toHaveLog('NewPendingAdmin', {
          newPendingAdmin: newAdmin
        });
      });
    });
  });