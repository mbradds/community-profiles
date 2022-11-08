import { appError } from "./util";

export async function getCommunityData() {
  try {
    const url =
      process.env.NODE_ENV === "development"
        ? "https://cp-admin.azurewebsites.net/api/communities"
        : "https://cp-admin.azurewebsites.net/api/communities";

    const response = await fetch(url);

    if (!response.ok) {
      return appError("App Data Error", {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        url: response.url,
        message: `${response.status} ${response.statusText}`,
      });
    }
    const data = await response.json();
    return data.data;
  } catch (err) {
    return appError("App Data Error", err);
  }
}
