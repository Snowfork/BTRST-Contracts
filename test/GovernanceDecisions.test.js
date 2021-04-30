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
            expect(result.toString()).to.equal("10")
        });

        it("allows governor to set fee", async () => {
            await decisionModel.setMarketplaceFee(20, { from: governor });
            let result = await decisionModel.marketplaceFee();
            expect(result.toString()).to.equal("20")
        });

        it("reverts if the fee is greater than 99", async () => {
            expect(decisionModel.setMarketplaceFee(100, { from: governor })).to.eventually.be.rejectedWith("revert DecisionModel::setMarketplaceFee fee must be less than 100")
        })

        it("reverts if the sender is not governor", async () => {
            expect(decisionModel.setMarketplaceFee(30, { from: a1 })).to.eventually.be.rejectedWith("revert DecisionModel::setMarketplaceFee ACCESS FORBIDDEN")
        });
    });

    describe("marketplaceCatgories", () => {
        it("allows governor to add category", async () => {
            await decisionModel.addMarketplaceCategory("sample category", { from: governor });
            expect(await decisionModel.getMarketplaceCategories()).to.include("sample category")
        });

        it("reverts if the sender is not governor", async () => {
            expect(decisionModel.addMarketplaceCategory("sample category", { from: a1 })).to.eventually.be.rejectedWith("revert DecisionModel::setMarketplaceFee ACCESS FORBIDDEN")
        });
    });

    describe("memberships", () => {
        it("allows governor to add membership", async () => {
            await decisionModel.addFoundationMember("sample member", { from: governor });
            expect(await decisionModel.getMemberships()).to.include("sample member")
        });

        it("reverts if the sender is not governor", async () => {
            expect(decisionModel.addFoundationMember("sample member", { from: a1 })).to.eventually.be.rejectedWith("revert DecisionModel::setMarketplaceFee ACCESS FORBIDDEN")
        });
    });
});  
