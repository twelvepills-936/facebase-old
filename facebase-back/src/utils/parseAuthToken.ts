type DecodedUser = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  photo_url: string;
  auth_date: number;
  language_code: string;
  hash: string;
};

type ParsedAuthToken = {
  user: DecodedUser;
  initDataRaw: string;
  startParam: string;
};

export const parseAuthToken = (token: string): ParsedAuthToken => {
  const initDataRaw = token.split(" ")[1];

  const decodedInitDataRaw = atob(initDataRaw as string);

  const initDataParams = new URLSearchParams(decodedInitDataRaw as string);
  const encodedUser = initDataParams.get("user");

  const decodedUser = JSON.parse(decodeURIComponent(encodedUser as string));

  return {
    user: decodedUser,
    initDataRaw: atob(initDataRaw),
    startParam: initDataParams.get("start_param") as string,
  };
};
