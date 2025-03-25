import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'fieldwire/v3 (api/6.1.3)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * Show account information
   *
   */
  get_account(): Promise<FetchResponse<200, types.GetAccountResponse200>> {
    return this.core.fetch('/account', 'get');
  }

  /**
   * Update an account
   *
   */
  update_account(body: types.UpdateAccountBodyParam): Promise<FetchResponse<201, types.UpdateAccountResponse201>> {
    return this.core.fetch('/account', 'patch', body);
  }

  /**
   * Gets all the Users on your Account plus Users invited to Projects on your Account. 
   *
   * The API also returns the count of projects they are in. Does not include Sample
   * Projects. Does not include people who are on other paying accounts. Essentially these
   * are the people you are paying for. 
   *
   * ```json
   * [
   *   {
   *     "user": {
   *       "created_at": "2019-10-15T19:49:01.802Z",
   *       "updated_at": "2021-03-12T22:29:06.467Z",
   *       "email_addresses": [
   *         {
   *           "email": "owner@construction.com",
   *           "is_primary": true
   *         }
   *       ],
   *       "id": 2141,
   *       "account_id": 2153,
   *       "company": "Construction.com",
   *       "company_type": null,
   *       "email": "owner@construction.com",
   *       "first_name": "Owner",
   *       "in_app_purchase_end_at": null,
   *       "invited_by_id": 18,
   *       "is_confirmed": true,
   *       "is_email_deliverable": true,
   *       "job_title": "Owner",
   *       "language": "en",
   *       "last_name": "Name",
   *       "phone_number": "3343434343",
   *       "photo_url": "https://s3.amazonaws.com/photo.png",
   *       "current_sign_in_at": "2021-03-12T22:29:06.454Z",
   *       "account_role": "account_admin",
   *       "email_notifications": "instantly",
   *       "sync_scheme": "smart_cellular"
   *     },
   *     "projects": 165
   *   },
   *   {
   *     "user": {
   *       "created_at": "2020-03-26T17:31:26.160Z",
   *       "updated_at": "2021-02-05T00:58:45.944Z",
   *       "email_addresses": [
   *         {
   *           "email": "member@construction.com",
   *           "is_primary": true
   *         }
   *       ],
   *       "id": 2823,
   *       "account_id": 2153,
   *       "company": "Construction.com",
   *       "company_type": null,
   *       "email": "member@construction.com",
   *       "first_name": "Heather",
   *       "in_app_purchase_end_at": null,
   *       "invited_by_id": 2813,
   *       "is_confirmed": true,
   *       "is_email_deliverable": true,
   *       "job_title": null,
   *       "language": "en",
   *       "last_name": "0326a",
   *       "phone_number": "555 555 5555",
   *       "photo_url": null,
   *       "current_sign_in_at": "2020-04-21T00:23:01.537Z",
   *       "account_role": "account_member",
   *       "email_notifications": "instantly",
   *       "sync_scheme": "smart_cellular"
   *     },
   *     "projects": 3
   *   },
   *   {
   *     "user": {
   *         "created_at": "2021-03-10T01:59:44.961Z",
   *         "updated_at": "2021-03-10T02:02:24.694Z",
   *         "email_addresses": [{
   *             "email": "bob@acme.com",
   *             "is_primary": true
   *         }],
   *         "id": 74312,
   *         "account_id": 74333,
   *         "company": null,
   *         "company_type": null,
   *         "email": "bob@acme.com",
   *         "first_name": "Bob",
   *         "in_app_purchase_end_at": null,
   *         "invited_by_id": 2141,
   *         "is_confirmed": true,
   *         "is_email_deliverable": true,
   *         "job_title": null,
   *         "language": "en",
   *         "last_name": "030921a",
   *         "phone_number": null,
   *         "photo_url": null,
   *         "current_sign_in_at": "2021-03-10T02:02:24.203Z",
   *         "account_role": "account_admin",
   *         "email_notifications": "instantly",
   *         "sync_scheme": "smart_cellular"
   *     },
   *     "projects": 1
   *   }
   * ]
   * ```
   *
   * This endpoint drives the [People Tab](https://app.fieldwire.com/#!/index/people). More
   * information about [Account Managers vs. Account Users vs. Project Users can be found
   * here](https://help.fieldwire.com/hc/en-us/articles/115000637206).
   *
   * @summary Show all users for an account
   */
  get_users_in_account(): Promise<FetchResponse<200, types.GetUsersInAccountResponse200>> {
    return this.core.fetch('/account/users', 'get');
  }

  /**
   * Gets a user on your account by Id. The API also returns the count of projects that user
   * is in.
   *
   * ```json
   *
   * {
   *   "user": {
   *     "created_at": "2019-10-15T19:49:01.802Z",
   *     "updated_at": "2021-03-12T22:29:06.467Z",
   *     "email_addresses": [
   *       {
   *         "email": "owner@construction.com",
   *         "is_primary": true
   *       }
   *     ],
   *     "id": 2141,
   *     "account_id": 2153,
   *     "company": "Construction.com",
   *     "company_type": null,
   *     "email": "owner@construction.com",
   *     "first_name": "Owner",
   *     "in_app_purchase_end_at": null,
   *     "invited_by_id": 18,
   *     "is_confirmed": true,
   *     "is_email_deliverable": true,
   *     "job_title": "Owner",
   *     "language": "en",
   *     "last_name": "Name",
   *     "phone_number": "3343434343",
   *     "photo_url": "https://s3.amazonaws.com/photo.png",
   *     "current_sign_in_at": "2021-03-12T22:29:06.454Z",
   *     "account_role": "account_admin",
   *     "email_notifications": "instantly",
   *     "sync_scheme": "smart_cellular"
   *   },
   *   "projects": 165
   * }
   *
   * ```
   *
   * @summary Get user by ID
   */
  get_user_by_id(metadata: types.GetUserByIdMetadataParam): Promise<FetchResponse<200, types.GetUserByIdResponse200>> {
    return this.core.fetch('/account/users/{id}', 'get', metadata);
  }

  /**
   * Update the account info for a user
   *
   */
  update_account_info_for_user(body: types.UpdateAccountInfoForUserBodyParam, metadata: types.UpdateAccountInfoForUserMetadataParam): Promise<FetchResponse<201, types.UpdateAccountInfoForUserResponse201>> {
    return this.core.fetch('/account/users/{id}', 'patch', body, metadata);
  }

  /**
   * Remove a user from account
   *
   */
  delete_user_from_account(metadata: types.DeleteUserFromAccountMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/account/users/{id}', 'delete', metadata);
  }

  /**
   * Update the profile of a user in account
   *
   */
  update_account_user_profile(body: types.UpdateAccountUserProfileBodyParam, metadata: types.UpdateAccountUserProfileMetadataParam): Promise<FetchResponse<201, types.UpdateAccountUserProfileResponse201>> {
    return this.core.fetch('/account/users/{id}/profile', 'patch', body, metadata);
  }

  /**
   * Invite a new or existing user to account
   *
   */
  invite_user_to_account(body: types.InviteUserToAccountBodyParam): Promise<FetchResponse<200, types.InviteUserToAccountResponse200>> {
    return this.core.fetch('/account/users/invite', 'post', body);
  }

  /**
   * Update the account_role for a list of user ids
   *
   */
  batch_update_user_account_role(body: types.BatchUpdateUserAccountRoleBodyParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/account/users/batch', 'patch', body);
  }

  /**
   * Remove a batch of users from the account
   *
   */
  batch_delete_users_from_account(body: types.BatchDeleteUsersFromAccountBodyParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/account/users/batch_account_users', 'delete', body);
  }

  /**
   * The JWT generated through this endpoint has limited lifetime. Our
   * [authentication](https://developers.fieldwire.com/docs/authentication) guide carries
   * more information about the entire flow
   *
   * @summary Generate a JSON Web Token (JWT)
   */
  generate_jwt_for_api_key(body: types.GenerateJwtForApiKeyBodyParam): Promise<FetchResponse<201, types.GenerateJwtForApiKeyResponse201>> {
    return this.core.fetch('/api_keys/jwt', 'post', body);
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { BatchDeleteUsersFromAccountBodyParam, BatchUpdateUserAccountRoleBodyParam, DeleteUserFromAccountMetadataParam, GenerateJwtForApiKeyBodyParam, GenerateJwtForApiKeyResponse201, GetAccountResponse200, GetUserByIdMetadataParam, GetUserByIdResponse200, GetUsersInAccountResponse200, InviteUserToAccountBodyParam, InviteUserToAccountResponse200, UpdateAccountBodyParam, UpdateAccountInfoForUserBodyParam, UpdateAccountInfoForUserMetadataParam, UpdateAccountInfoForUserResponse201, UpdateAccountResponse201, UpdateAccountUserProfileBodyParam, UpdateAccountUserProfileMetadataParam, UpdateAccountUserProfileResponse201 } from './types';
