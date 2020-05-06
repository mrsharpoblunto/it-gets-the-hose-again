/**
 * @format
 */
export function handleApiError(res, history) {
  if (!res.ok) {
    if (res.status === 401) {
      history.replace('/login');
    }
    return Promise.reject(`Received response code ${res.status}`);
  } else {
    return res.json();
  }
}
