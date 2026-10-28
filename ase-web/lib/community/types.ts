import type { Copy } from "@/lib/i18n";

export type PostKind = "analysis" | "recommendation";
export type RecStatus = "open" | "success" | "failed";

export type Analyst = {
  id: string;
  nameAr: string;
  nameEn: string;
  initials: string;
  sector: string;
  bio: Copy;
  joined: string;
  followers: number;
  rating: number;
  reviewCount: number;
  consulting: boolean;
  consultingNote: Copy;
};

export type RecOutcome = {
  status: RecStatus;
  due: string;
  judgedOn: string | null;
  profitThen: number | null;
  profitNow: number | null;
  scoreThen: number | null;
  scoreNow: number | null;
  priceThen: number | null;
  priceNow: number | null;
};

export type Post = {
  id: string;
  analystId: string;
  kind: PostKind;
  symbol: string;
  companyEn: string;
  companyAr: string;
  published: string;
  title: Copy;
  body: Copy;
  reactions: { useful: number; agree: number };
  outcome: RecOutcome | null;
};

export type Comment = {
  id: string;
  postId: string;
  authorAr: string;
  authorEn: string;
  published: string;
  body: Copy;
};

export type Review = {
  id: string;
  analystId: string;
  authorAr: string;
  authorEn: string;
  rating: number;
  published: string;
  body: Copy;
};

export type Community = {
  analysts: Analyst[];
  posts: Post[];
  comments: Comment[];
  reviews: Review[];
};
