export interface apiSuperCategoryModel {
  id: number;
  name: string;
  description: string;
  active: number;
  createdby: number;
  modifiedby: number;
  created_at: string;
  modified_at: string;
  isEdit: boolean;
  message: string;
}

export interface apiMasterCategoryModel {
  id: number;
  name: string;
  description: string;
  supercategoryid: number;
  orderid: number;
  active: number;
  createdby: number;
  modifiedby: number;
  created_at: string;
  modified_at: string;
  isEdit: boolean;
  message: string;
}

export interface apiSlaveCategoryModel {
  id: number;
  name: string;
  description: string;
  initials: string;
  orderid: number;
  mastercategoryid: number;
  active: number;
  createdby: number;
  modifiedby: number;
  created_at: string;
  modified_at: string;
  isEdit: boolean;
}
