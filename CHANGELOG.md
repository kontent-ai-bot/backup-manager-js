# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [4.2.2](https://github.com/kontent-ai/backup-manager-js/compare/v4.2.1...v4.2.2) (2023-11-27)

updates Kontent.ai SDK version

### [4.2.1](https://github.com/kontent-ai/backup-manager-js/compare/v4.2.0...v4.2.1) (2023-11-23)


### Bug Fixes

* fixes referencing assets by codenames, clears renditions array ([cb1de13](https://github.com/kontent-ai/backup-manager-js/commit/cb1de1331e1dd6e4ba9159055b27fa93ad3ee8d4))

## [4.2.0](https://github.com/kontent-ai/backup-manager-js/compare/v4.1.0...v4.2.0) (2023-10-11)


### Features

* updates all dependencies, uses environment instead of project naming convetion, migrates to eslint, removes obsolete project validation ([05f1270](https://github.com/kontent-ai/backup-manager-js/commit/05f1270395f2dcbc076b6bf7c4f50f29bfc252af))
* updates deps ([436230d](https://github.com/kontent-ai/backup-manager-js/commit/436230d29074fa645e03e55aa51e7fdcb297e086))

## [4.1.0](https://github.com/kontent-ai/backup-manager-js/compare/v4.0.1...v4.1.0) (2022-09-14)


### Features

* adds ability to customize retry strategy ([4c3a2a8](https://github.com/kontent-ai/backup-manager-js/commit/4c3a2a8ea9327e4b9247a04061b75c3aedbf7c34))
* extends console logging with more data & colors ([9085d8d](https://github.com/kontent-ai/backup-manager-js/commit/9085d8dce96efe4dd8908dbfcd0a44a4b5b95827))
* updates deps ([68817d2](https://github.com/kontent-ai/backup-manager-js/commit/68817d27488cbc527a4cbe5960f429629611fb89))

### [4.0.1](https://github.com/kontent-ai/backup-manager-js/compare/v4.0.0...v4.0.1) (2022-07-22)


### Bug Fixes

* fixes code sample in readme (fixes https://github.com/kontent-ai/backup-manager-js/issues/29) ([2514d55](https://github.com/kontent-ai/backup-manager-js/commit/2514d55dc44de33c5bab7ccc802ffe67d5398ab6))
* moves skipping of items before id translation so that id can be referenced (fixes https://github.com/kontent-ai/backup-manager-js/issues/34) ([9d1a472](https://github.com/kontent-ai/backup-manager-js/commit/9d1a472eecb12b4c30cbedc962317369a4407e41))

## [4.0.0](https://github.com/kontent-ai/backup-manager-js/compare/v4.0.0-0...v4.0.0) (2022-07-14)

## [4.0.0-0](https://github.com/kontent-ai/backup-manager-js/compare/v3.4.0...v4.0.0-0) (2022-07-14)


### ⚠ BREAKING CHANGES

* Adds support for backing up & restoring workflows as well as keeping the workflow status of imported language variants. Because of this the now deprecated "workflowSteps" are removed in favor of dedicated "workflows".  Adds new configuration option 'preserveWorkflow'.

### Features

* Adds support for archived language variants ([0175776](https://github.com/kontent-ai/backup-manager-js/commit/01757760599a879c6ec19ffc6d8b97cc3c61088e))
* Adds support for backing up & restoring workflows as well as keeping the workflow status of imported language variants. Because of this the now deprecated "workflowSteps" are removed in favor of dedicated "workflows".  Adds new configuration option 'preserveWorkflow'. ([2465f64](https://github.com/kontent-ai/backup-manager-js/commit/2465f640dbdb437c1cdfbe208c0d80590f6f79c5))


### Bug Fixes

* fixes error when restoring backup created with skipped validation endpoint ([2652531](https://github.com/kontent-ai/backup-manager-js/commit/26525313a451080df4b7ecaad3644b5d92b99e03))

## [3.4.0](https://github.com/kontent-ai/backup-manager-js/compare/v3.3.1...v3.4.0) (2022-05-31)


### Features

* adds support for exporting webhooks & collections ([e3f6cc2](https://github.com/kontent-ai/backup-manager-js/commit/e3f6cc2f1af7298aab36f5c14a000bb0a8a00c3d))
* updates deps ([5851315](https://github.com/kontent-ai/backup-manager-js/commit/5851315c6d874d55780534201284df7b588ebc04))

### [3.3.1](https://github.com/kontent-ai/backup-manager-js/compare/v3.3.0...v3.3.1) (2022-05-04)


### Bug Fixes

* Removes unnecessary usage of project validation endpoint ([973c35b](https://github.com/kontent-ai/backup-manager-js/commit/973c35bce253e403e3724f091618300acc9eed6f))

## [3.3.0](https://github.com/kontent-ai/backup-manager-js/compare/v3.2.1...v3.3.0) (2022-05-03)


### Features

* adds ability to skip validation endpoint in project export ([0870404](https://github.com/kontent-ai/backup-manager-js/commit/0870404a124edad3f61a3e5a04f87987b3126d64))
* updates all dependencies ([8615809](https://github.com/kontent-ai/backup-manager-js/commit/8615809555ecf7ded51a56beb0a1c749e51c7791))


### Bug Fixes

* show file service log when enabled ([ea35621](https://github.com/kontent-ai/backup-manager-js/commit/ea356219059574f86a3e071f9837afece4189e08))

### [3.2.1](https://github.com/kontent-ai/backup-manager-js/compare/v3.2.0...v3.2.1) (2021-12-14)


### Bug Fixes

* use unique alias for 'enablePublish' option ([f5ea556](https://github.com/kontent-ai/backup-manager-js/commit/f5ea556dad51767f4d5db9c177c5c6d1b22dd084))

## [3.2.0](https://github.com/kontent-ai/backup-manager-js/compare/v3.1.0...v3.2.0) (2021-12-14)


### Features

* updates deps ([f09c6b8](https://github.com/kontent-ai/backup-manager-js/commit/f09c6b842670fbc980b4f0b00190dd485bd4fa49))

## [3.1.0](https://github.com/kontent-ai/backup-manager-js/compare/v3.0.1...v3.1.0) (2021-09-24)


### Features

* updates deps ([e2022e4](https://github.com/kontent-ai/backup-manager-js/commit/e2022e41ad5c561230d574740c3aebbd4e812eef))

### [3.0.1](https://github.com/kontent-ai/backup-manager-js/compare/v3.0.0...v3.0.1) (2021-08-04)


### Bug Fixes

* fixes a scenario where language variants are not published because workflow id was not available, but codename was ([fa67eb4](https://github.com/kontent-ai/backup-manager-js/commit/fa67eb4472491b24df2b6d62c5fcf756bf7a1774))
* fixes debug scripts ([601b1d5](https://github.com/kontent-ai/backup-manager-js/commit/601b1d5bc436f85fdfd990615435791c62b0a8b9))

## [3.0.0](https://github.com/kontent-ai/backup-manager-js/compare/v2.0.0...v3.0.0) (2021-07-19)


### ⚠ BREAKING CHANGES

* renames "process" import option to "canImport", updates docs & samples

### Features

* adds list of supported types for export filter hint ([eb53229](https://github.com/kontent-ai/backup-manager-js/commit/eb532298c10991276ab0464842b32315803eb4eb))
* renames "process" import option to "canImport", updates docs & samples ([39c36ab](https://github.com/kontent-ai/backup-manager-js/commit/39c36ab0746360be5cdeb44f7af3d4d87548f12c))
* updates deps ([6225e26](https://github.com/kontent-ai/backup-manager-js/commit/6225e26e9af60e21a3658a203246ca1f963e75b4))
* updates deps, uses HttpService to export binary files (enables retry strategy for exporting assets). Fixes https://github.com/kontent-ai/backup-manager-js/issues/18 ([9b7a14c](https://github.com/kontent-ai/backup-manager-js/commit/9b7a14cdf784cce2d9a5a2b4dcb65a222d3d5b65))

## [1.16.0](https://github.com/kontent-ai/backup-manager-js/compare/v1.15.1...v1.16.0) (2021-04-15)


### Features

* adds warning message regarding version mismatch ([b4c9584](https://github.com/kontent-ai/backup-manager-js/commit/b4c95845e2e62fe04fb270b9b12c76f6ff1cdbfb))

### [1.15.1](https://github.com/kontent-ai/backup-manager-js/compare/v1.15.0...v1.15.1) (2021-03-17)


### Bug Fixes

* sets maxBodyLength as infinity to enable upload of large files ([76ff94c](https://github.com/kontent-ai/backup-manager-js/commit/76ff94cb9d213f3524f0fca0168f691736c7cd76))

## [1.15.0](https://github.com/kontent-ai/backup-manager-js/compare/v1.14.0...v1.15.0) (2021-02-24)


### Features

* adds support for exporting workflow steps ([f2878a2](https://github.com/kontent-ai/backup-manager-js/commit/f2878a20ff6b76cf047831be356cc7f0e07146f7))
* adds support for preserving publish & fixes custom workflow step assignment ([ac1e8a0](https://github.com/kontent-ai/backup-manager-js/commit/ac1e8a068050fe98543c312a36430abbc7b9a395))
* updates deps ([b8aff5a](https://github.com/kontent-ai/backup-manager-js/commit/b8aff5ae86702ce2878cb0eb11de32b9bb38fd5b))

## [1.14.0](https://github.com/kontent-ai/backup-manager-js/compare/v1.13.0...v1.14.0) (2021-01-08)


### Features

* updates dependencies ([36875b4](https://github.com/kontent-ai/backup-manager-js/commit/36875b481517286424f722ca92eee86934ea31cb))

## [1.13.0](https://github.com/kontent-ai/backup-manager-js/compare/v1.12.0...v1.13.0) (2020-12-17)


### Features

* uses different endpoint for fetching language variants to ensure all variants are loaded ([6bdda7d](https://github.com/kontent-ai/backup-manager-js/commit/6bdda7d5b7aaf73103f46ade0a6a14e31b9ece30))

## [1.12.0](https://github.com/kontent-ai/backup-manager-js/compare/v1.11.0...v1.12.0) (2020-10-21)


### Features

* adds ability to set artificial delay between asset download requests & wait until asset is downloaded before proceeding to next ([3855127](https://github.com/kontent-ai/backup-manager-js/commit/3855127d563ef5452529beb634126aed08d18e9f))


### Bug Fixes

* skips processing of content types when not necessary ([2df86f2](https://github.com/kontent-ai/backup-manager-js/commit/2df86f2ba6bc2e63cb85408e70bcdccde0254df6))

## [1.11.0](https://github.com/kontent-ai/backup-manager-js/compare/v1.10.0...v1.11.0) (2020-10-21)


### Features

* updates dependencies ([62597c6](https://github.com/kontent-ai/backup-manager-js/commit/62597c630cd7d66767e74f5ab0568b4dc77033e2))

## [1.10.0](https://github.com/kontent-ai/backup-manager-js/compare/v1.9.0...v1.10.0) (2020-10-07)


### Features

* processes items per page instead of waiting until all items are fetched from API + updates all dependencies ([f4a5b50](https://github.com/kontent-ai/backup-manager-js/commit/f4a5b50575a9f1505893f148a60cd2cb0f19d1a4))

## [1.9.0](https://github.com/kontent-ai/backup-manager-js/compare/v1.8.0...v1.9.0) (2020-09-22)


### Features

* skips import if import items.count = 0, logs information about skipped types ([ca4dee2](https://github.com/kontent-ai/backup-manager-js/commit/ca4dee2fea5ef2f1ea82a68dc7c3d1bfc147e32e))

## [1.8.0](https://github.com/kontent-ai/backup-manager-js/compare/v1.7.1...v1.8.0) (2020-08-07)


### Features

* do not process content type if content type is not supposed to be exported ([a463b6a](https://github.com/kontent-ai/backup-manager-js/commit/a463b6a5236ea09273990b7a1e953d6037bb59e3))


### Bug Fixes

* fixes kontent not encoding # in url ([9707990](https://github.com/kontent-ai/backup-manager-js/commit/970799096142f09dcc1cf12b18e158d3ec347f6c))

### [1.7.1](https://github.com/kontent-ai/backup-manager-js/compare/v1.7.0...v1.7.1) (2020-08-06)


### Bug Fixes

* updates readme ([b5a93bd](https://github.com/kontent-ai/backup-manager-js/commit/b5a93bd0bd039fcacce9e29e33208c1e231a48e6))

## [1.7.0](https://github.com/kontent-ai/backup-manager-js/compare/v1.6.0...v1.7.0) (2020-08-06)


### Features

* adds ability to export only selected data types (https://github.com/kontent-ai/backup-manager-js/issues/3) ([fd38c54](https://github.com/kontent-ai/backup-manager-js/commit/fd38c54021fea44a40d06ebc945e688281f976db))


### Bug Fixes

* uses pager to export all items for certain object types (fixes https://github.com/kontent-ai/backup-manager-js/issues/4) ([5d81e13](https://github.com/kontent-ai/backup-manager-js/commit/5d81e1312070217e63e5aa0884a2105ed200470d))

## [1.6.0](https://github.com/kontent-ai/backup-manager-js/compare/v1.5.0...v1.6.0) (2020-07-17)


### Features

* adds ability to set custom baseUrl for API calls ([6f379b4](https://github.com/kontent-ai/backup-manager-js/commit/6f379b41825019d6e6e5419a0d71f45b93145b9f))

## [1.5.0](https://github.com/kontent-ai/backup-manager-js/compare/v1.4.0...v1.5.0) (2020-05-19)


### Features

* logs language information ([a64e00f](https://github.com/kontent-ai/backup-manager-js/commit/a64e00f931cd9d129da3256df547393fa33d1fd6))
* separates all node.js code and makes backup manager browser friendly ([bfd046c](https://github.com/kontent-ai/backup-manager-js/commit/bfd046c07eeb176e5812359c89869d9e32d222a1))
* updates deps ([2ac3669](https://github.com/kontent-ai/backup-manager-js/commit/2ac3669357f8be2e679f2fb416cd471b9fc2c664))
* uses axios to download files instead of node.js 'https'. This makes it compatible with browsers as well as node.js. ([dbb9e57](https://github.com/kontent-ai/backup-manager-js/commit/dbb9e579ea722adf2a966b1eb6f12ba92e59747d))


### Bug Fixes

* moves file helper to proper location ([e97462a](https://github.com/kontent-ai/backup-manager-js/commit/e97462a61b1f06ba667ae5cdcbb4732ef8ef0e41))

## [1.4.0](https://github.com/kontent-ai/backup-manager-js/compare/v1.3.0...v1.4.0) (2020-05-11)


### Features

* checks if language with requested codneame exists before updating language codename ([aac1389](https://github.com/kontent-ai/backup-manager-js/commit/aac1389117170df979102997a72d01743693132d))

## [1.3.0](https://github.com/kontent-ai/backup-manager-js/compare/v1.2.2...v1.3.0) (2020-05-11)


### Features

* unifies package metadata ([47c45f5](https://github.com/kontent-ai/backup-manager-js/commit/47c45f541d6b649dd9b5a35efd50fc090e71674c))

### [1.2.2](https://github.com/kontent-ai/backup-manager-js/compare/v1.2.1...v1.2.2) (2020-04-27)


### Bug Fixes

* fixes main path ([5c9fccd](https://github.com/kontent-ai/backup-manager-js/commit/5c9fccd233f853670b9a45240f1d0d20c1613882))

### [1.2.1](https://github.com/kontent-ai/backup-manager-js/compare/v1.2.0...v1.2.1) (2020-04-27)


### Bug Fixes

* adds types hint path to package.json ([da67c77](https://github.com/kontent-ai/backup-manager-js/commit/da67c77ce61fa1268fb35f1b869aca72c234e88e))

## [1.2.0](https://github.com/kontent-ai/backup-manager-js/compare/v1.1.1...v1.2.0) (2020-04-08)


### Features

* updates cm sdk dependency ([c33f72a](https://github.com/kontent-ai/backup-manager-js/commit/c33f72ac90626ff1bb21033bc6fbdc9d0548e652))

### [1.1.1](https://github.com/kontent-ai/backup-manager-js/compare/v1.1.0...v1.1.1) (2020-04-08)

## [1.1.0](https://github.com/kontent-ai/backup-manager-js/compare/v0.0.9...v1.1.0) (2020-04-08)


### Features

* exports ZipService ([d4d8543](https://github.com/kontent-ai/backup-manager-js/commit/d4d854388c24cf35eb04f81e004366932b5ef51a))
* makes default workflow id optional ([cd6d03e](https://github.com/kontent-ai/backup-manager-js/commit/cd6d03e1358d49100c19762056167cf58af92801))

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
