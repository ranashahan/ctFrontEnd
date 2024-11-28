import { apiAssessmentModel } from './Assessment';

export interface apiCategoryModel {
  id: number;
  name: string;
  initials: string;
  assessments: apiAssessmentModel[];
}

export interface apiMasterCategoryModel {
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
