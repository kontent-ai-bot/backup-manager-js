# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.2.2](https://github.com/Kentico/kontent-backup-manager-js/compare/v1.2.1...v1.2.2) (2020-04-27)


### Bug Fixes

* fixes main path ([5c9fccd](https://github.com/Kentico/kontent-backup-manager-js/commit/5c9fccd233f853670b9a45240f1d0d20c1613882))

### [1.2.1](https://github.com/Kentico/kontent-backup-manager-js/compare/v1.2.0...v1.2.1) (2020-04-27)


### Bug Fixes

* adds types hint path to package.json ([da67c77](https://github.com/Kentico/kontent-backup-manager-js/commit/da67c77ce61fa1268fb35f1b869aca72c234e88e))

## [1.2.0](https://github.com/Kentico/kontent-backup-manager-js/compare/v1.1.1...v1.2.0) (2020-04-08)


### Features

* updates cm sdk dependency ([c33f72a](https://github.com/Kentico/kontent-backup-manager-js/commit/c33f72ac90626ff1bb21033bc6fbdc9d0548e652))

### [1.1.1](https://github.com/Kentico/kontent-backup-manager-js/compare/v1.1.0...v1.1.1) (2020-04-08)

## [1.1.0](https://github.com/Kentico/kontent-backup-manager-js/compare/v0.0.9...v1.1.0) (2020-04-08)


### Features

* exports ZipService ([d4d8543](https://github.com/Kentico/kontent-backup-manager-js/commit/d4d854388c24cf35eb04f81e004366932b5ef51a))
* makes default workflow id optional ([cd6d03e](https://github.com/Kentico/kontent-backup-manager-js/commit/cd6d03e1358d49100c19762056167cf58af92801))

### [0.0.9](https://github.com/Enngage/kontent-backup-manager/compare/v0.0.8...v0.0.9) (2020-04-08)


### Bug Fixes

* prevents generating report file if there are no inconsistencies ([2804130](https://github.com/Enngage/kontent-backup-manager/commit/2804130e2adca475b0000ba226317a8aeee3aa47))

### [0.0.8](https://github.com/Enngage/kontent-backup-manager/compare/v0.0.7...v0.0.8) (2020-04-08)


### Features

* adds data overview to metadata as well as version of library used to export data ([f09a3fa](https://github.com/Enngage/kontent-backup-manager/commit/f09a3fae54c39c71d18e211c7dde0e9913981237))

### [0.0.7](https://github.com/Enngage/kontent-backup-manager/compare/v0.0.6...v0.0.7) (2020-04-08)

### [0.0.6](https://github.com/Enngage/kontent-backup-manager/compare/v0.0.5...v0.0.6) (2020-04-02)


### Features

* adds support for fixing language in target project & enables it by default for CLI restoration ([0d0c911](https://github.com/Enngage/kontent-backup-manager/commit/0d0c911570a6b9fcf8a3b9a11a99fb1a954d5c5f))


### Bug Fixes

* always set external_id rather then preserving default values for consistency. ([99ac6d5](https://github.com/Enngage/kontent-backup-manager/commit/99ac6d51dd3344baf7e09b9379c8aa7fe9aad5cf))

### 0.0.5 (2020-03-23)


### Features

* adds complete messages ([9f7609e](https://github.com/Enngage/kontent-backup-manager/commit/9f7609e70b6555076a8a09292b33f37029c1b5a6))
* adds condition to skip unsupported files (files that are  > 100MB) and adds retry policy for all errors ([ee7a1c2](https://github.com/Enngage/kontent-backup-manager/commit/ee7a1c28592ffe54f59be67e01094e3e25a88c93))
* adds debug profiles ([5a97461](https://github.com/Enngage/kontent-backup-manager/commit/5a974611ec5204b68ae87228da958c9532a8f7b0))
* adds project validation checks & force CLI option to export/import project with issues, creates all dummy content types & snippets before creating elements ([b7b8dc5](https://github.com/Enngage/kontent-backup-manager/commit/b7b8dc5e0bf654ee2b80f0fdf2a43d93b3fd5b99))
* adds sample code & readme ([3275b88](https://github.com/Enngage/kontent-backup-manager/commit/3275b88bf4338712ce014e8aabf5ce3e09d0d9cb))
* adds support for exporting & import asset folders & assets inside ([8608c29](https://github.com/Enngage/kontent-backup-manager/commit/8608c290b36ad2bb09ed68637e7f9d42a5b99578))
* adds support for importing content groups ([e542b7d](https://github.com/Enngage/kontent-backup-manager/commit/e542b7dc703e1d2969f5a084f08edd71b265e8ea))
* adds ZipService for creating packages and stores assets as files inside ([df0aff6](https://github.com/Enngage/kontent-backup-manager/commit/df0aff62f6e77e02092ddcffc6c5fad2c4c7e98a))
* first working prototype with CLI support ([9bf80ad](https://github.com/Enngage/kontent-backup-manager/commit/9bf80ade9b9b5270afb62dc492178a8578772378))
* further improves performance of translating ids to codenames by storing previously found codenames ([1c1d49c](https://github.com/Enngage/kontent-backup-manager/commit/1c1d49c4867658f6bebfd6cd1eab764b8cc69e65))
* implements base import / export story, cleans asset folders, translates ids of imported data in rich text elems ([6f4623a](https://github.com/Enngage/kontent-backup-manager/commit/6f4623a0b55a39d7bb41e2df80e7d313cb77ae1a))
* implements reading from zip files & prepares base id translation helper and supports importing assets with binary files ([e781d8b](https://github.com/Enngage/kontent-backup-manager/commit/e781d8b6d7ba451630b2db31e678a48c4fe1179e))
* imports dummy content type & snippets before feeding them with data to avoid conflicts with non-existing items, adds Infinity mode to maxContentLength to allow uploading large files ([a1277d2](https://github.com/Enngage/kontent-backup-manager/commit/a1277d26d3e174211c7b5aabecd09c437a6faf01))
* improves cli logging ([2f41f8b](https://github.com/Enngage/kontent-backup-manager/commit/2f41f8b7a9c721c69261fb01978051e12f09cf12))
* improves error messages in CLI ([083a1f8](https://github.com/Enngage/kontent-backup-manager/commit/083a1f828718b2088bcb8cc4060c34d45675628b))
* improves handling of languages during import and automatically skips already existing languages or notifies if language is invalid ([80b2b76](https://github.com/Enngage/kontent-backup-manager/commit/80b2b76a79ad9679ce3bf218ef61683cae5f954e))
* improves logging ([cb37f7a](https://github.com/Enngage/kontent-backup-manager/commit/cb37f7a979b99972ae9310572663a5065a8f3f4d))
* improves logging of errors before backup / import - stores log file on FS ([a476e4d](https://github.com/Enngage/kontent-backup-manager/commit/a476e4d65136e64304098b720ebbd4dffee52041))
* optimizes translation helpers ([3ab8400](https://github.com/Enngage/kontent-backup-manager/commit/3ab8400b6955a961bd65d9a66c37fa17b67bc763))
* prepares core functionality for importing data (ordering, extracting depds..) ([ddebf52](https://github.com/Enngage/kontent-backup-manager/commit/ddebf52ee5ce8dbfe1ea8ab1f213a9dba9d6d825))
* refactors code to use external_id instead of codenames in content types / snippets & taxonomies ([9c5ff72](https://github.com/Enngage/kontent-backup-manager/commit/9c5ff72da9c19132be2613ce801357cc6d523960))
* skips assets with 100MB binary files ([c6d64d2](https://github.com/Enngage/kontent-backup-manager/commit/c6d64d2ee8c59f28ad85de590aff73a4e366609f))
* updates deps & adds support for execution in CLI without config file ([b156e2e](https://github.com/Enngage/kontent-backup-manager/commit/b156e2e7311b7dcea21f17d1d449ba5f845aa431))


### Bug Fixes

* fixes bin script path ([e735151](https://github.com/Enngage/kontent-backup-manager/commit/e73515149d5bdab1564bff034cf20962feac0604))
* fixes condition identifying rich text content ([c5d45fd](https://github.com/Enngage/kontent-backup-manager/commit/c5d45fdb0c819e2c8a108cdbc6afe75168395eaa))
* translates ids to codenames for language data ([ec411ef](https://github.com/Enngage/kontent-backup-manager/commit/ec411ef85dc983a5e4ea5bee598351d34e16a737))
* uses proper method to export all assets ([4bdb38a](https://github.com/Enngage/kontent-backup-manager/commit/4bdb38a4b7cb88e49cd2591f6b18dabd3ecbc891))
