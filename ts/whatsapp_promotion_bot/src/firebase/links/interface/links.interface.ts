export interface FirebaseLinkData {
  id: string;
  link: string;
  count: number;
  statusError: boolean;
}

export interface FirebaseSaveLinkData {
  link: string;
  count: number;
  statusError: boolean;
}

export interface FirebaseUpdateLinkData {
  id: string;
  link: string;
  count: number;
  statusError: boolean;
}
