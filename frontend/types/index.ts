export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  prompt: string;
  created_at: string;
  updated_at: string;
  website_plan: WebsitePlan | null;
  design_tokens: DesignToken | null;
  components: Component[];
}

export interface WebsitePlan {
  id: string;
  plan_json: Record<string, unknown>;
  created_at: string;
}

export interface DesignToken {
  id: string;
  tokens_json: Record<string, unknown>;
  created_at: string;
}

export interface Component {
  id: string;
  name: string;
  code: string;
  file_path: string;
  order_num: number;
}

export interface Version {
  id: string;
  version_number: number;
  snapshot_json: {
    components: {
      name: string;
      code: string;
      file_path: string;
      order_num: number;
    }[];
  };
  message: string | null;
  created_at: string;
}

export interface GenerationProgress {
  step: string;
  status: "started" | "in_progress" | "complete" | "failed";
  component?: string;
  data?: unknown;
  message?: string;
  index?: number;
  total?: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
