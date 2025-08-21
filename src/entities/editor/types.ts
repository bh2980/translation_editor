export type Status = {
  id: string;
  name: string;
  color: string;
};

export type Entry = {
  id: string;
  key: string;
  source: string;
  target: string;
  statusId: string;
};

