import {
  DiscoveryApi,
  IdentityApi,
  createApiRef,
} from '@backstage/core-plugin-api';

export class AuthenticationError extends Error {
  public loginUrl: string;

  constructor(loginUrl: string) {
    window.location.href = loginUrl;
    super(`Authentication required at ${loginUrl}`);
    this.name = 'AuthenticationError';
    this.loginUrl = loginUrl;
  }
}

export class APIError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'APIError';
  }
}
export interface Metadata {
  target: string;
  source?: string;
  otherLabels?: string[];
}
export interface Rule {
  name: string;
  metadata?: Metadata;
  labels?: string[];
  file?: {
    id: number;
  };
}

export type Tags = {
  name: string;
  source: SourceBuffer;
  virutal: boolean;
};

export type Ref = {
  id: number;
  name: string;
};
export interface ITypeOptions {
  key: string;
  value: string;
}

export interface RulesetImage {
  id: number;
  name?: string;
}

export enum RulesetKind {
  CATEGORY = 'category',
}
export interface Repository {
  kind?: string;
  branch?: string;
  path?: string;
  url?: string;
}
export interface Ruleset {
  id?: number;
  kind?: RulesetKind;
  name?: string;
  description?: string;
  rules: Rule[];
  repository?: Repository;
  identity?: Ref;
}
export interface TargetLabel {
  name: string;
  label: string;
}
export interface Target {
  id: number;
  name: string;
  description?: string;
  choice?: boolean;
  custom?: boolean;
  labels?: TargetLabel[];
  image?: RulesetImage;
  ruleset: Ruleset;
  provider?: string;
}
export type IdentityKind =
  | 'source'
  | 'maven'
  | 'proxy'
  | 'basic-auth'
  | 'bearer';

export interface Identity {
  id: number;
  createUser?: string;
  updateUser?: string;
  createTime?: string;
  kind: IdentityKind;
  name: string;
  description?: string;
  user?: string;
  password?: string;
  key?: string;
  settings?: string;
}

export type Application = {
  id: string;
  name: string;
  description: string;
  buisnessService?: Ref;
  assessed: boolean;
  owner?: Ref;
  tags?: Tags[];
  effort?: number;
  risk?: number;
  comments?: string;
  binary?: string;
  bucket?: {
    id: string;
    name: string;
  };
};
export interface MTAApi {
  getTargets(): Promise<Target[]>;
  getIdentities(): Promise<Identity[]>;
  analyzeMTAApplications(
    applicationId: string,
    analysisOptions: any,
  ): Promise<any>;
}

export const mtaApiRef = createApiRef<MTAApi>({
  id: 'plugin.mta',
});

export class DefaultMtaApi implements MTAApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly identityApi: IdentityApi;

  async getIdentities(): Promise<Identity[]> {
    const url = await this.discoveryApi.getBaseUrl('mta');
    const { token: idToken } = await this.identityApi.getCredentials();

    const response = await fetch(`${url}/identities`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
      referrerPolicy: 'no-referrer-when-downgrade',
      redirect: 'error',
    });

    if (response.status === 401) {
      const j = await response.json();
      throw new AuthenticationError(j.loginURL);
    }

    if (!response.ok) {
      throw new APIError(
        `Request failed with status ${
          response.status
        }: ${await response.text()}`,
        response.status,
      );
    }

    return await response.json();
  }

  async getTargets(): Promise<Target[]> {
    const url = await this.discoveryApi.getBaseUrl('mta');
    const { token: idToken } = await this.identityApi.getCredentials();

    const response = await fetch(`${url}/targets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
      referrerPolicy: 'no-referrer-when-downgrade',
      redirect: 'error',
    });

    if (response.status === 401) {
      const j = await response.json();
      throw new AuthenticationError(j.loginURL);
    }

    if (!response.ok) {
      throw new APIError(
        `Request failed with status ${
          response.status
        }: ${await response.text()}`,
        response.status,
      );
    }

    return await response.json();
  }

  async analyzeMTAApplications(
    applicationId: string,
    analysisOptions: any,
  ): Promise<Application> {
    const url = await this.discoveryApi.getBaseUrl('mta');
    const { token: idToken } = await this.identityApi.getCredentials();

    const response = await fetch(
      `${url}/analyze-application/${applicationId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
        body: JSON.stringify(analysisOptions),
        referrerPolicy: 'no-referrer-when-downgrade',
      },
    );

    if (response.status === 401) {
      const jsonResponse = await response.json();
      throw new AuthenticationError(jsonResponse.loginURL);
    }

    if (!response.ok) {
      throw new APIError(
        `Request failed with status ${
          response.status
        }: ${await response.text()}`,
        response.status,
      );
    }

    return await response.json();
  }

  constructor(options: {
    discoveryApi: DiscoveryApi;
    identityApi: IdentityApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
  }
}
