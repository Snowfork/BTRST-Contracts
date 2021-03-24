const GovernanceDecisions = artifacts.require("GovernanceDecisions");
require("chai")
    .use(require("chai-as-promised"))
    .expect();

describe("GovernanceDecisions", () => {
    let root, governor, a1, accounts;
    let decisionModel;

    beforeEach(async () => {
        [root, governor, a1, ...accounts] = await web3.eth.getAccounts();

        decisionModel = await GovernanceDecisions.new(governor);
    });

    describe("marketplaceFee", () => {
        it("has default fee", async () => {
            let result = await decisionModel.marketplaceFee();
            expect(result.toString()).to.equal("1")
        });

        it("allows governor to set fee", async () => {
            await decisionModel.setMarketplaceFee(10, { from: governor });
            let result = await decisionModel.marketplaceFee();
            expect(result.toString()).to.equal("10")
        });

        it("reverts if the fee is greater than 99", async () => {
            expect(decisionModel.setMarketplaceFee(100, { from: governor })).to.eventually.be.rejectedWith("revert DecisionModel::setMarketplaceFee fee must be less than 100")
        })

        it("reverts if the sender is not governor", async () => {
            expect(decisionModel.setMarketplaceFee(20, { from: a1 })).to.eventually.be.rejectedWith("revert DecisionModel::setMarketplaceFee ACCESS FORBIDDEN")
        });
    });
});  
