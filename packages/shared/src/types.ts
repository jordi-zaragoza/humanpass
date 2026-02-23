export type User = {
  id: string;
  created_at: string;
};

export type Link = {
  id: string;
  user_id: string;
  short_code: string;
  created_at: string;
};

export type VerifyLinkResponse = {
  verified: boolean;
  createdAt: string;
};

export type GenerateLinkResponse = {
  url: string;
  shortCode: string;
  createdAt: string;
};
