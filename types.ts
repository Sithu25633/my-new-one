
export interface Photo {
  id: string;
  url: string;
  category: string;
  createdAt: string;
  name: string;
}

export interface Video {
  id: string;
  url: string;
  category: string;
  createdAt: string;
  name: string;
}

export interface Letter {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
