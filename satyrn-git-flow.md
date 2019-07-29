# Satyrn's Git flow

## Overview

This page is an abstract of the Git branching model used for collaborating for the Satyrn project. 
The original article my be found [here](http://nvie.com/posts/a-successful-git-branching-model/)

## Branches

### Master

Used for production releases only, named "master". There is never a reason to commit directly into 
this branch. Master branches are merged from release branches after thorough testing and tagged with
the appropriate version. In limited situations, hotfixes may be merged into master.

### Develop

This is the integration branch, named "develop". Successfully tested features are merged into this 
branch to create candidates for release.

### Features

Create a feature branch when you need to implement any new capability. As you develop more complicated 
features, merge develop into the branch to stay up-to-date. When the feature is complete, merge the 
current development branch **into** the feature and test thoroughly. Then make a pull request for integrating 
the feature into development.

The merge back into development should be done only once it is clear the feature won't break anything.

| Branch Name | Features | 
| -----------:|----------|
| __Naming convention__ | feature/*_ |
| __Branched off from__ | develop |
| __Creation commands__ | git checkout -b feature/myfeature develop |
| __Merge back to__ | develop |
| __Finish commands__ | git checkout develop<br>git merge --no-ff feature/myfeature<br>git branch -d feature/myfeature<br>git push origin develop | 

### Release Candidates

A release branch is a candidate for release. Prior to creating the branch, the current develop branch
should have passed all tests and be ready for release. The release stage is where the production 
version is bumped in source files and any other final adjustments from dev to release are made, and 
a final suite of tests is performed.

| Branch Name | Releases |
| -----------:|----------|
| __Naming convention__ | rc-* |
| __Branched off from__ | develop |
| __Creation commands__ | git checkout -b rc-1.2.0 develop<br>_...prepare release..._<br>git commit |
| __Merge back to__ | master, then master into develop | 
| __Finish commands__ | git checkout master<br>git merge --no-ff rc-1.2<br>git tag -a v1.2.0<br>git checkout develop<br>git merge --no-ff rc-1.2<br>_...solve conflicts..._<br>git branch -d rc-1.2|

### Hotfixes

Hotfix branches are created to fix a severe bug in a previous release. After the fix has been 
validated it must be merged back to the release increasing the version naming and to develop 
(or incoming release if any).

| Branch Name | Hotfixes |
| -----------:|----------|
| __Naming convention__ | hf-* |
| __Branched off from__ | master |
| __Creation commands__ | git checkout -b hf-1.2.1 master<br>_...make hotfix..._<br> git commit |
| __Merge back to__ | master and develop (or release candidate branch, if any)| 
| __Finish commands__ | git checkout master<br>git merge --no-ff hf-1.2.1<br>git tag -a v1.2.1<br>git checkout develop<br>git merge --no-ff hf-1.2.1<br>git branch -d hf-1.2.1|

## Graphic summary

[[git_branch_model.png]]

# Release Naming
## SemVer
Satyrn releases follow the [SemVer](http://semver.org) naming convention:

> Given a version number MAJOR.MINOR.PATCH, increment the:
 * MAJOR version when you make incompatible API changes,
 * MINOR version when you add functionality in a backwards-compatible manner, and
 * PATCH version when you make backwards-compatible bug fixes.

> Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format.

## GIT
Versions are stored as tags in git. You can use git to list or add a version.

For example, to list all tags:
```
git tag
```
To list the most recenly applied tag:
```
git for-each-ref refs/tags --sort=-taggerdate --format='%(refname:short)' --count=1
```

## Production Releases
All production release versions are of the format
* ** vMAJOR.MINOR.PATCH **

These versions are applied and incremented under the control of software development.

## Non-Production Releases
For non-production releases, we use four extensions appended to the appropriate production release version:
* **-i*N* **  Internal Releases
* **-rc*N* ** Release Candidates
* **-hf*N* ** Hotfixes
* **-branch*N* ** Branch Releases

In each case, the ** *N* ** increments every release of that kind, restarting from one with each new base version. 

For example, if the last production release is v2.0.10, the next three internal releases will be 
* v2.0.10-i1
* v2.0.10-i2
* v2.0.10-i3


### Internal Releases 
** vMAJOR.MINOR.PATCH-i*N*  **
Internal releases are built from develop and use the current production release version, assuming that release has been merged into develop (as it should be immediately upon release).

For example:
* v1.2.3-i5
* v2.0.10-i2
* v2.1.0-i1

The internal release is the Nth iteration built from develop since the identified production release.

To make an internal release, 
* find the most recent internal release version, 
* increment it, 
* pull from develop, 
* generate a well-formed internal release suitable for testing
* record the new internal release count as a tag in git
* push the internal release to github


### Release Candidates
** vMAJOR.MINOR.PATCH-rc*N* **
Release candidates represent a feature-frozen testable release hoping to become the next production release. The base version for a release candidate is the **future** release for which this is a candidate.

For example, consider a "patch" level release candidate built when the current production release is v4.0.3 and the current internal release is v4.0.3-i6. This release candidate will reside in the rc/v4.0.4 branch and the versions of its testable releases increment from v4.0.4:
* **v4.0.4-rc1**
* **v4.0.4-rc2**
* **v4.0.4-rc3**

Release candidates depend on proper naming of the next version, but each extension is simply incremental. It is up to the creator 
of the release candidate branch to decide what the new version is, applying the SemVer rules for Major, Minor, and Patch numbering.
As the release candidate changes from bug fixes, increment the rc#, e.g., go from v4.0.4-rc1 to v4.0.4-rc2.

Validation will most often use release candidates for testing.

### Hotfixes
** vMAJOR.MINOR.PATCH-hf*N* **
Hotfixes are used for small, **isolated** bug fixes applied to the latest production release. 
They are only valid as hotfixes if a small test regimen is believed to be sufficient for validating the work.

They are always patch level version increments because any Major or Minor version changes would
 trigger a full validation. Going from v2.0.10 to v2.1.0 can't be a hotfix because a minor level 
 adds functionality and may have unisolated consequences.

The base version for hotfixes starts with an incremented patch version from the current production 
release. v4.0.5 produces a v4.0.6-hf1.

Hotfix releases are used for testing the hotfix, incrementing as necessary until all appropriate tests pass. 

For example, if the current production release is v4.0.5, the first three hotfix iterations will be
* **v4.0.6-hf1**
* **v4.0.6-hf2**
* **v4.0.6-hf3**

Once validation succeeds, the new production release version will be **v4.0.6**.

Each hotfix represents a feature-frozen candidate for the next production release. New features should 
never be added during a given hotfix, nor between two hotfixes in process. Features 
must always go through validation as release candidate, then merged to master. Any hotfixes that were from
the previous master branch will need to be manually cherry picked and applied to the new master after
the feature's release candidate is merge in.

### Branch Releases
** vMAJOR.MINOR.PATCH-branch*N*  **
Branch releases are for internal testing of specific branches other than master and develop. For 
example, if we have a major feature like an upgrade to the tracker, which is not yet in develop 
but needs testing, a developer can take that feature branch, e.g., feature/centroidTracker and 
build a release suitable for testing.

Branch release extensions are based on the camelCase version of the branch, followed by an incremental counter. They also  include the base version of the most recent production release merged into their code.

For example, consider a centroid tracker feature branched from develop when the production version was 4.0.5. The branch releases would be of the following form:
* **v4.0.5-featureCentroidTracker1**
* **v4.0.5-featureCentroidTracker2**
* **v4.0.5-featureCentroidTracker3**

If a new production release is created with an updated version, and that codebase gets merged into the feature branch, then the base of the version is then be updated and the increment restarted at 1.

For example, consider that same centroid tracker, branched from develop at v4.0.5. While working on that feature, a hotfix, v4.0.6 is released to production. The changes in the hotfix also get merged into develop. When develop is eventually merged into feature/centroidTracker, the base version of the branch releases updates and the increments restart:
* **v4.0.6-featureCentroidTracker1**
* **v4.0.6-featureCentroidTracker2**
* **v4.0.6-featureCentroidTracker3**

This allows any testers to know what baseline feature set (and bugs) should be expected when evaluating the new feature.

## Summary of Naming Conventions
### **Production Releases** vMajor.Minor.Patch
No extension. This is the format of the base in all non-production releases.
### **Internal Releases** base-i*N*
Base is from the latest production release, which will have been merged into develop.
### **Release Candidates** base-rc*N*
Base is from the future production release for which this release is a candidate.
### **Hotfixes** base-hf*N*
Base is from the future production release, which must be a patch increment over the latest production release.
### **Branch Releases** base-branch*N*
The base is from the most recently merged production release and the branch is the camelCase version of the branch name.
