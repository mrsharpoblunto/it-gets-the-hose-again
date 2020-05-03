export function apiError(err, history) {
  if (err.status === 401) {
    history.replace('/login');
  }
}
