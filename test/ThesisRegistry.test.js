const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ThesisRegistry", function () {
  let thesisRegistry;
  let owner;
  let author;
  let otherUser;

  beforeEach(async function () {
    [owner, author, otherUser] = await ethers.getSigners();
    
    const ThesisRegistry = await ethers.getContractFactory("ThesisRegistry");
    thesisRegistry = await ThesisRegistry.deploy();
    await thesisRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await thesisRegistry.owner()).to.equal(owner.address);
    });

    it("Should start with zero theses", async function () {
      expect(await thesisRegistry.getTotalTheses()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint thesis with valid parameters", async function () {
      const uri = "ipfs://QmTest123";
      const royaltyBps = 1000; // 10%

      const tx = await thesisRegistry.connect(author).mintThesis(uri, royaltyBps);
      const receipt = await tx.wait();

      // Check event emission
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === "ThesisMinted"
      );
      expect(event).to.not.be.undefined;
      expect(event.args.author).to.equal(author.address);
      expect(event.args.uri).to.equal(uri);
      expect(event.args.royaltyBps).to.equal(royaltyBps);

      // Check thesis was created
      const thesis = await thesisRegistry.getThesis(1);
      expect(thesis.uri).to.equal(uri);
      expect(thesis.author).to.equal(author.address);
      expect(thesis.royaltyBps).to.equal(royaltyBps);
      expect(thesis.exists).to.be.true;
    });

    it("Should reject empty URI", async function () {
      await expect(
        thesisRegistry.connect(author).mintThesis("", 1000)
      ).to.be.revertedWith("URI cannot be empty");
    });

    it("Should reject royalty below minimum (1%)", async function () {
      await expect(
        thesisRegistry.connect(author).mintThesis("ipfs://QmTest", 99)
      ).to.be.revertedWith("Royalty must be between 1% and 100%");
    });

    it("Should reject royalty above maximum (100%)", async function () {
      await expect(
        thesisRegistry.connect(author).mintThesis("ipfs://QmTest", 10001)
      ).to.be.revertedWith("Royalty must be between 1% and 100%");
    });

    it("Should accept royalty at minimum boundary (1%)", async function () {
      await expect(
        thesisRegistry.connect(author).mintThesis("ipfs://QmTest", 100)
      ).to.not.be.reverted;
    });

    it("Should accept royalty at maximum boundary (100%)", async function () {
      await expect(
        thesisRegistry.connect(author).mintThesis("ipfs://QmTest", 10000)
      ).to.not.be.reverted;
    });

    it("Should increment token IDs correctly", async function () {
      await thesisRegistry.connect(author).mintThesis("ipfs://QmTest1", 1000);
      await thesisRegistry.connect(author).mintThesis("ipfs://QmTest2", 2000);
      await thesisRegistry.connect(author).mintThesis("ipfs://QmTest3", 3000);

      expect(await thesisRegistry.getTotalTheses()).to.equal(3);
    });

    it("Should track theses by author", async function () {
      await thesisRegistry.connect(author).mintThesis("ipfs://QmTest1", 1000);
      await thesisRegistry.connect(author).mintThesis("ipfs://QmTest2", 2000);
      await thesisRegistry.connect(otherUser).mintThesis("ipfs://QmTest3", 3000);

      const authorTheses = await thesisRegistry.getThesesByAuthor(author.address);
      expect(authorTheses.length).to.equal(2);
      expect(authorTheses[0]).to.equal(1);
      expect(authorTheses[1]).to.equal(2);

      const otherUserTheses = await thesisRegistry.getThesesByAuthor(otherUser.address);
      expect(otherUserTheses.length).to.equal(1);
      expect(otherUserTheses[0]).to.equal(3);
    });
  });

  describe("Metadata Updates", function () {
    beforeEach(async function () {
      await thesisRegistry.connect(author).mintThesis("ipfs://QmTest", 1000);
    });

    it("Should allow author to update metadata", async function () {
      const newUri = "ipfs://QmNewTest";
      const tx = await thesisRegistry.connect(author).updateMetadata(1, newUri);
      const receipt = await tx.wait();

      // Check event emission
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === "MetadataUpdated"
      );
      expect(event).to.not.be.undefined;
      expect(event.args.tokenId).to.equal(1);
      expect(event.args.newUri).to.equal(newUri);

      // Check metadata was updated
      const thesis = await thesisRegistry.getThesis(1);
      expect(thesis.uri).to.equal(newUri);
    });

    it("Should reject update from non-author", async function () {
      await expect(
        thesisRegistry.connect(otherUser).updateMetadata(1, "ipfs://QmNewTest")
      ).to.be.revertedWith("Only author can update metadata");
    });

    it("Should reject empty URI update", async function () {
      await expect(
        thesisRegistry.connect(author).updateMetadata(1, "")
      ).to.be.revertedWith("URI cannot be empty");
    });

    it("Should reject update for non-existent thesis", async function () {
      await expect(
        thesisRegistry.connect(author).updateMetadata(999, "ipfs://QmNewTest")
      ).to.be.revertedWith("Thesis does not exist");
    });
  });

  describe("Queries", function () {
    it("Should check if thesis exists", async function () {
      expect(await thesisRegistry.thesisExists(1)).to.be.false;
      
      await thesisRegistry.connect(author).mintThesis("ipfs://QmTest", 1000);
      
      expect(await thesisRegistry.thesisExists(1)).to.be.true;
      expect(await thesisRegistry.thesisExists(2)).to.be.false;
    });

    it("Should revert when getting non-existent thesis", async function () {
      await expect(
        thesisRegistry.getThesis(999)
      ).to.be.revertedWith("Thesis does not exist");
    });

    it("Should return empty array for author with no theses", async function () {
      const theses = await thesisRegistry.getThesesByAuthor(author.address);
      expect(theses.length).to.equal(0);
    });
  });
});
