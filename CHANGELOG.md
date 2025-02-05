## [1.4.0](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v1.3.2...v1.4.0) (2025-02-05)

### Changes
* Added a new ShareView feature that enables secure sharing of preview content outside of the ContentCreator.

### UPDATE NOTICE

ShareView is a mode of the Frontend API ecosystem that allows users to preview content outside the ContentCreator without requiring it to be released in FirstSpirit.

This feature involves a token generation process that grants users access to a generated token, enabling them to view preview content from the Frontend API Backend or a similar implementation of the Frontend API Server package.

While the functionality works out of the box, some configuration steps are required to enable this view. Refer to the [Frontend API documentation](https://docs.e-spirit.com/ecom/fsconnect-com-api/fsconnect-com-frontend-api/latest/share-view/).

## [1.3.2](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v1.3.1...v1.3.2) (2025-01-09)

### Changes
* Updated version number to be consistent with client package.

## [1.3.1](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v1.3.0...v1.3.1) (2024-12-20)

### Changes
* Updated version number to be consistent with client package.

## [1.3.0](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v1.2.1...v1.3.0) (2024-10-22)

### Changes
* Updated version number to be consistent with client package.

## [1.2.1](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v1.2.0...v1.2.1) (2024-10-16)

### Changes
* Fixed security vulnerabilities by updating the relevant dependencies.

## [1.2.0](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v1.1.0...v1.2.0) (2024-10-09)

### Changes
* Added the ability to fetch project properties directly through the Frontend API.

## [1.1.0](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v1.0.1...v1.1.0) (2024-07-10)

### Changes
* Optimized build pipeline.

## [1.0.1](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v1.0.0...v1.0.1) (2024-06-05)

### Changes
* Added Open API specification to the server.
* Removed express as a dependency for the APIs core.

## [1.0.0](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v0.25.0...v1.0.0) (2024-05-17)

### Changes
* Added the ability to configure FirstSpirit remote projects.
* Improved compatibility with custom Frontend API Backends for projects not using express.js.
* Frontend API is now generally available.

## [0.25.0](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v0.24.0...v0.25.0) (2024-03-22)

### Changes
* Add possibility to add plugins.

## [0.24.0](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v0.23.0...v0.24.0) (2024-02-12)

### Changes
* Fixed security vulnerabilities located in lodash (CVE-2020-8203) and semver (CVE-2022-25883) by updating the relevant dependencies.

## [0.23.0](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v0.22.0...v0.23.0) (2024-01-30)

### Changes
* Updated version number to be consistent with client package.

## [0.22.0](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v0.20.0...v0.22.0) (2024-01-22)

### Changes
* Added configuration to filter untranslated sections.
* Improved error handling for an invalid locale format.

### UPDATE NOTICE
* If the filter for untranslated sections is enabled in the Frontend API Backend configuration, the "Add content" button is rendered if there is no content for the section for the current language. Please note that the input components of the section templates must be language-dependent, otherwise this can lead to undesirable side effects.

## [0.20.0](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v0.19.0...v0.20.0) (2023-12-21)

### Changes
* Fixed a bug where the FirstSpirit server origin was exposed to the frontend.

## [0.19.0](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v0.18.0...v0.19.0) (2023-12-20)

### Changes
* Optimization of config validation.

## [0.18.0](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v0.17.0...v0.18.0) (2023-12-01)

### Changes
* Removed a circular dependency.

## [0.17.0](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v0.16.0...v0.17.0) (2023-11-27)

### Changes
* No changes or updates in this release.

## [0.16.0](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v0.15.0...v0.16.0) (2023-11-16)

### Changes
* Moved the array access for `findPage()` from the client to the server package.
* Updated information about language attributes in API documentation.

### UPDATE NOTICE
* For single element access in `findPage()`, we moved the array access to the Server package to support server side rendering. As by definition `findPage()` can only find one item, `findPage()` now returns a single FindPageItem instead of an Array with one FindPageItem.

## [0.15.0](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v0.13.1...v0.15.0) (2023-11-02)

### Changes
* No changes or updates in this release.

## [0.13.1](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v0.13.0...v0.13.1) (2023-10-25)

### Changes
* No changes or updates in this release.

## [0.13.0](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v0.12.1...v0.13.0) (2023-10-06)

### Changes
* Enhanced the configuration loading to support URLs with trailing slashes.

## [0.12.1](https://github.com/e-Spirit/fcecom-frontend-api-server/compare/v0.12.0...v0.12.1) (2023-09-08)

### Changes
* External links in API documentation are now opened in a new browser tab.


Information on previous releases can be found in the [Release Notes](https://docs.e-spirit.com/ecom/fsconnect-com/FirstSpirit_Connect_for_Commerce_Releasenotes_EN.html).
