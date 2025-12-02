const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UniversityValidator", function () {
  let validator;
  let owner;
  let supervisor1;
  let supervisor2;
  let student;

  beforeEach(async function () {
    [owner, supervisor1, supervisor2, student] = await ethers.getSigners();
    
    const UniversityValidator = await ethers.getContractFactory("UniversityValidator");
    validator = await UniversityValidator.deploy();
    await validator.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await validator.owner()).to.equal(owner.address);
    });

    it("Should grant DEFAULT_ADMIN_ROLE to owner", async function () {
      const DEFAULT_ADMIN_ROLE = await validator.DEFAULT_ADMIN_ROLE();
      expect(await validator.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Supervisor Management", function () {
    it("Should add supervisor with university", async function () {
      const university = "University of Lagos";
      
      await expect(
        validator.addSupervisor(supervisor1.address, university)
      )
        .to.emit(validator, "SupervisorAdded")
        .withArgs(supervisor1.address, university);

      expect(await validator.isSupervisor(supervisor1.address)).to.be.true;
      expect(await validator.getSupervisorUniversity(supervisor1.address)).to.equal(university);
    });

    it("Should reject adding supervisor with empty university", async function () {
      await expect(
        validator.addSupervisor(supervisor1.address, "")
      ).to.be.revertedWith("University name required");
    });

    it("Should reject adding supervisor with zero address", async function () {
      await expect(
        validator.addSupervisor(ethers.ZeroAddress, "University")
      ).to.be.revertedWith("Invalid supervisor address");
    });

    it("Should reject adding supervisor from non-owner", async function () {
      await expect(
        validator.connect(student).addSupervisor(supervisor1.address, "University")
      ).to.be.reverted; // Ownable: caller is not the owner
    });

    it("Should remove supervisor", async function () {
      await validator.addSupervisor(supervisor1.address, "University");
      
      await expect(
        validator.removeSupervisor(supervisor1.address)
      )
        .to.emit(validator, "SupervisorRemoved")
        .withArgs(supervisor1.address);

      expect(await validator.isSupervisor(supervisor1.address)).to.be.false;
    });

    it("Should reject removing non-supervisor", async function () {
      await expect(
        validator.removeSupervisor(student.address)
      ).to.be.revertedWith("Not a supervisor");
    });

    it("Should reject removing supervisor from non-owner", async function () {
      await validator.addSupervisor(supervisor1.address, "University");
      
      await expect(
        validator.connect(student).removeSupervisor(supervisor1.address)
      ).to.be.reverted; // Ownable: caller is not the owner
    });

    it("Should add multiple supervisors", async function () {
      await validator.addSupervisor(supervisor1.address, "University of Lagos");
      await validator.addSupervisor(supervisor2.address, "Makerere University");

      expect(await validator.isSupervisor(supervisor1.address)).to.be.true;
      expect(await validator.isSupervisor(supervisor2.address)).to.be.true;
      expect(await validator.getSupervisorUniversity(supervisor1.address)).to.equal("University of Lagos");
      expect(await validator.getSupervisorUniversity(supervisor2.address)).to.equal("Makerere University");
    });
  });

  describe("Thesis Validation", function () {
    beforeEach(async function () {
      await validator.addSupervisor(supervisor1.address, "University of Lagos");
    });

    it("Should validate thesis by supervisor", async function () {
      const tokenId = 1;
      const signature = "0x"; // Empty signature for now

      await expect(
        validator.connect(supervisor1).validate(tokenId, signature)
      )
        .to.emit(validator, "ThesisValidated")
        .withArgs(tokenId, supervisor1.address, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));

      expect(await validator.isValidated(tokenId)).to.be.true;
      expect(await validator.getValidator(tokenId)).to.equal(supervisor1.address);
    });

    it("Should reject validation from non-supervisor", async function () {
      await expect(
        validator.connect(student).validate(1, "0x")
      ).to.be.revertedWith("Only supervisors can validate");
    });

    it("Should reject validation of already validated thesis", async function () {
      await validator.connect(supervisor1).validate(1, "0x");
      
      await expect(
        validator.connect(supervisor1).validate(1, "0x")
      ).to.be.revertedWith("Thesis already validated");
    });

    it("Should reject validation with invalid token ID", async function () {
      await expect(
        validator.connect(supervisor1).validate(0, "0x")
      ).to.be.revertedWith("Invalid token ID");
    });

    it("Should store complete validation info", async function () {
      const tokenId = 1;
      await validator.connect(supervisor1).validate(tokenId, "0x");

      const info = await validator.getValidationInfo(tokenId);
      expect(info.isValidated).to.be.true;
      expect(info.validator).to.equal(supervisor1.address);
      expect(info.university).to.equal("University of Lagos");
      expect(info.timestamp).to.be.gt(0);
    });

    it("Should allow different supervisors to validate different theses", async function () {
      await validator.addSupervisor(supervisor2.address, "Makerere University");

      await validator.connect(supervisor1).validate(1, "0x");
      await validator.connect(supervisor2).validate(2, "0x");

      expect(await validator.isValidated(1)).to.be.true;
      expect(await validator.isValidated(2)).to.be.true;
      expect(await validator.getValidator(1)).to.equal(supervisor1.address);
      expect(await validator.getValidator(2)).to.equal(supervisor2.address);

      const info1 = await validator.getValidationInfo(1);
      const info2 = await validator.getValidationInfo(2);
      expect(info1.university).to.equal("University of Lagos");
      expect(info2.university).to.equal("Makerere University");
    });
  });

  describe("Queries", function () {
    beforeEach(async function () {
      await validator.addSupervisor(supervisor1.address, "University of Lagos");
      await validator.connect(supervisor1).validate(1, "0x");
    });

    it("Should check if thesis is validated", async function () {
      expect(await validator.isValidated(1)).to.be.true;
      expect(await validator.isValidated(2)).to.be.false;
    });

    it("Should get validator address", async function () {
      expect(await validator.getValidator(1)).to.equal(supervisor1.address);
    });

    it("Should revert getting validator for unvalidated thesis", async function () {
      await expect(
        validator.getValidator(999)
      ).to.be.revertedWith("Thesis not validated");
    });

    it("Should revert getting validation info for unvalidated thesis", async function () {
      await expect(
        validator.getValidationInfo(999)
      ).to.be.revertedWith("Thesis not validated");
    });

    it("Should check if address is supervisor", async function () {
      expect(await validator.isSupervisor(supervisor1.address)).to.be.true;
      expect(await validator.isSupervisor(student.address)).to.be.false;
    });

    it("Should get supervisor university", async function () {
      expect(await validator.getSupervisorUniversity(supervisor1.address)).to.equal("University of Lagos");
    });

    it("Should revert getting university for non-supervisor", async function () {
      await expect(
        validator.getSupervisorUniversity(student.address)
      ).to.be.revertedWith("Not a supervisor");
    });
  });

  describe("Access Control", function () {
    it("Should have correct SUPERVISOR_ROLE", async function () {
      const expectedRole = ethers.keccak256(ethers.toUtf8Bytes("SUPERVISOR_ROLE"));
      expect(await validator.SUPERVISOR_ROLE()).to.equal(expectedRole);
    });

    it("Should grant SUPERVISOR_ROLE when adding supervisor", async function () {
      await validator.addSupervisor(supervisor1.address, "University");
      
      const SUPERVISOR_ROLE = await validator.SUPERVISOR_ROLE();
      expect(await validator.hasRole(SUPERVISOR_ROLE, supervisor1.address)).to.be.true;
    });

    it("Should revoke SUPERVISOR_ROLE when removing supervisor", async function () {
      await validator.addSupervisor(supervisor1.address, "University");
      await validator.removeSupervisor(supervisor1.address);
      
      const SUPERVISOR_ROLE = await validator.SUPERVISOR_ROLE();
      expect(await validator.hasRole(SUPERVISOR_ROLE, supervisor1.address)).to.be.false;
    });
  });
});
