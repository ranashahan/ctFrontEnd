export interface apiActivityModel {
  id: number;
  name: string;
  description: string;
  initials: string;
  orderid: number;
  mastercategoryid: number;
  supercategoryid: number;
  slavecategoryid: number;
  active: number;
  createdby: number;
  modifiedby: number;
  created_at: string;
  modified_at: string;
  isEdit: boolean;
}
