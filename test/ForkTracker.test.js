const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ForkTracker", function () {
  let forkTracker;
  let thesisRegistry;
  let royaltySplitter;
  let owner;
  let author;
  let forker;

  beforeEach(async function () {
    [owner, author, forker] = await ethers.getSigners();
    
    // Deploy dependencies
    const ThesisRegistry = await ethers.getContractFactory("ThesisRegistry");
    thesisRegistry = await ThesisRegistry.deploy();
    await thesisRegistry.waitForDeployment();

    const RoyaltySplitter = await ethers.getContractFactory("RoyaltySplitter");
    royaltySplitter = await RoyaltySplitter.deploy();
    await royaltySplitter.waitForDeployment();

    // Deploy ForkTracker
    const ForkTracker = await ethers.getContractFactory("ForkTracker");
    forkTracker = await ForkTracker.deploy();
    await forkTracker.waitForDeployment();

    // Set contract references
    await forkTracker.setContracts(
      await thesisRegistry.getAddress(),
      await royaltySplitter.getAddress()
    );
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await forkTracker.owner()).to.equal(owner.address);
    });

    it("Should set contract addresses", async function () {
      expect(await forkTracker.thesisRegistry()).to.equal(
        await thesisRegistry.getAddress()
      );
      expect(await forkTracker.royaltySplitter()).to.equal(
        await royaltySplitter.getAddress()
      );
    });

    it("Should emit ContractsSet event", async function () {
      const ForkTracker = await ethers.getContractFactory("ForkTracker");
      const newForkTracker = await ForkTracker.deploy();
      await newForkTracker.waitForDeployment();

      await expect(
        newForkTracker.setContracts(
          await thesisRegistry.getAddress(),
          await royaltySplitter.getAddress()
        )
      )
        .to.emit(newForkTracker, "ContractsSet")
        .withArgs(
          await thesisRegistry.getAddress(),
          await royaltySplitter.getAddress()
        );
    });

    it("Should reject zero address for registry", async function () {
      const ForkTracker = await ethers.getContractFactory("ForkTracker");
      const newForkTracker = await ForkTracker.deploy();
      await newForkTracker.waitForDeployment();

      await expect(
        newForkTracker.setContracts(
          ethers.ZeroAddress,
          await royaltySplitter.getAddress()
        )
      ).to.be.revertedWith("Invalid registry address");
    });

    it("Should reject zero address for splitter", async function () {
      const ForkTracker = await ethers.getContractFactory("ForkTracker");
      const newForkTracker = await ForkTracker.deploy();
      await newForkTracker.waitForDeployment();

      await expect(
        newForkTracker.setContracts(
          await thesisRegistry.getAddress(),
          ethers.ZeroAddress
        )
      ).to.be.revertedWith("Invalid splitter address");
    });
  });

  describe("Thesis Registration", function () {
    it("Should register a thesis", async function () {
      await expect(forkTracker.registerThesis(1))
        .to.emit(forkTracker, "ForkTreeUpdated")
        .withArgs(1);

      const tree = await forkTracker.getForkTree(1);
      expect(tree.exists).to.be.true;
      expect(tree.depth).to.equal(0);
      expect(tree.parents.length).to.equal(0);
      expect(tree.children.length).to.equal(0);
    });

    it("Should reject registering same thesis twice", async function () {
      await forkTracker.registerThesis(1);
      
      await expect(
        forkTracker.registerThesis(1)
      ).to.be.revertedWith("Thesis already registered");
    });
  });

  describe("Forking", function () {
    beforeEach(async function () {
      // Register parent thesis
      await forkTracker.registerThesis(1);
    });

    it("Should create a fork", async function () {
      const tx = await forkTracker.connect(forker).forkThesis(1, "ipfs://QmFork");
      const receipt = await tx.wait();

      // Check ThesisForked event
      const forkEvent = receipt.logs.find(
        log => log.fragment && log.fragment.name === "ThesisForked"
      );
      expect(forkEvent).to.not.be.undefined;
      expect(forkEvent.args.parentId).to.equal(1);
      expect(forkEvent.args.author).to.equal(forker.address);

      const newTokenId = forkEvent.args.newTokenId;

      // Check fork tree was created
      const forkTree = await forkTracker.getForkTree(newTokenId);
      expect(forkTree.exists).to.be.true;
      expect(forkTree.parents.length).to.equal(1);
      expect(forkTree.parents[0]).to.equal(1);
      expect(forkTree.depth).to.equal(1);

      // Check parent's children array
      const parentTree = await forkTracker.getForkTree(1);
      expect(parentTree.children.length).to.equal(1);
      expect(parentTree.children[0]).to.equal(newTokenId);
    });

    it("Should reject fork with empty URI", async function () {
      await expect(
        forkTracker.connect(forker).forkThesis(1, "")
      ).to.be.revertedWith("URI cannot be empty");
    });

    it("Should create multi-level forks", async function () {
      // First fork
      const tx1 = await forkTracker.connect(forker).forkThesis(1, "ipfs://QmFork1");
      const receipt1 = await tx1.wait();
      const fork1Event = receipt1.logs.find(
        log => log.fragment && log.fragment.name === "ThesisForked"
      );
      const fork1Id = fork1Event.args.newTokenId;

      // Second level fork
      const tx2 = await forkTracker.connect(forker).forkThesis(fork1Id, "ipfs://QmFork2");
      const receipt2 = await tx2.wait();
      const fork2Event = receipt2.logs.find(
        log => log.fragment && log.fragment.name === "ThesisForked"
      );
      const fork2Id = fork2Event.args.newTokenId;

      // Check depths
      const tree1 = await forkTracker.getForkTree(1);
      const treeFork1 = await forkTracker.getForkTree(fork1Id);
      const treeFork2 = await forkTracker.getForkTree(fork2Id);

      expect(tree1.depth).to.equal(0);
      expect(treeFork1.depth).to.equal(1);
      expect(treeFork2.depth).to.equal(2);
    });

    it("Should track multiple children", async function () {
      await forkTracker.connect(forker).forkThesis(1, "ipfs://QmFork1");
      await forkTracker.connect(forker).forkThesis(1, "ipfs://QmFork2");
      await forkTracker.connect(forker).forkThesis(1, "ipfs://QmFork3");

      const parentTree = await forkTracker.getForkTree(1);
      expect(parentTree.children.length).to.equal(3);
    });
  });

  describe("Queries", function () {
    let fork1Id, fork2Id;

    beforeEach(async function () {
      await forkTracker.registerThesis(1);
      
      const tx1 = await forkTracker.forkThesis(1, "ipfs://QmFork1");
      const receipt1 = await tx1.wait();
      const event1 = receipt1.logs.find(
        log => log.fragment && log.fragment.name === "ThesisForked"
      );
      fork1Id = event1.args.newTokenId;

      const tx2 = await forkTracker.forkThesis(1, "ipfs://QmFork2");
      const receipt2 = await tx2.wait();
      const event2 = receipt2.logs.find(
        log => log.fragment && log.fragment.name === "ThesisForked"
      );
      fork2Id = event2.args.newTokenId;
    });

    it("Should get parents correctly", async function () {
      const parents = await forkTracker.getParents(fork1Id);
      expect(parents.length).to.equal(1);
      expect(parents[0]).to.equal(1);
    });

    it("Should get children correctly", async function () {
      const children = await forkTracker.getChildren(1);
      expect(children.length).to.equal(2);
      expect(children).to.include(fork1Id);
      expect(children).to.include(fork2Id);
    });

    it("Should check if thesis has children", async function () {
      expect(await forkTracker.hasChildren(1)).to.be.true;
      expect(await forkTracker.hasChildren(fork1Id)).to.be.false;
    });

    it("Should check if thesis is a fork", async function () {
      expect(await forkTracker.isFork(1)).to.be.false;
      expect(await forkTracker.isFork(fork1Id)).to.be.true;
    });

    it("Should get fork depth", async function () {
      expect(await forkTracker.getForkDepth(1)).to.equal(0);
      expect(await forkTracker.getForkDepth(fork1Id)).to.equal(1);
    });

    it("Should revert queries for non-existent thesis", async function () {
      await expect(
        forkTracker.getParents(999)
      ).to.be.revertedWith("Thesis does not exist");

      await expect(
        forkTracker.getChildren(999)
      ).to.be.revertedWith("Thesis does not exist");

      await expect(
        forkTracker.getForkTree(999)
      ).to.be.revertedWith("Thesis does not exist");

      await expect(
        forkTracker.getForkDepth(999)
      ).to.be.revertedWith("Thesis does not exist");
    });

    it("Should return false for hasChildren on non-existent thesis", async function () {
      expect(await forkTracker.hasChildren(999)).to.be.false;
    });

    it("Should return false for isFork on non-existent thesis", async function () {
      expect(await forkTracker.isFork(999)).to.be.false;
    });
  });
});
