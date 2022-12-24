type APIResponseSuccess<T> = {
  status: 'success';
  results?: number;
  data: T;
  message?: string;
};

type APIResponse<T = unknown> =
  | {
      status: 'fail' | 'error';
      message: string;
    }
  | APIResponseSuccess<T>;

type APIOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  body?: any;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
  mode?: RequestMode;
  file?: {
    body: File;
    headers: HeadersInit;
  };
  skipResponseParse?: boolean;
};

const wait = (s: number) =>
  new Promise<never>((_, reject) =>
    setTimeout(() => {
      reject(`Request timeout. Server took too long to respond (${s} seconds)`);
    }, s * 1000)
  );

/**
 *
 * @param path string to append to: `apiUrl/api/v1/`, or an absolute url passed as: `{ url: '...' }`
 * @param options `.method` (default: GET), `.body` if including data
 */
export const client = async <T = unknown>(
  path: string | { url: string },
  options?: APIOptions
) => {
  if (!options) options = {};

  const url =
    typeof path === 'string'
      ? `${import.meta.env.VITE_API_URL}/${path}`
      : path.url;

  try {
    const apiPromise = fetch(url, {
      method: options.method || 'GET',
      credentials: options.credentials || 'include',
      mode: options.mode || 'cors',
      ...(options.body && {
        body: JSON.stringify(options.body),
        headers: options.headers || { 'Content-Type': 'application/json' },
      }),
      ...(options.method === 'PUT' && options.file && options.file),
    });

    let res: Response;

    try {
      res = await Promise.race([apiPromise, wait(10)]);
    } catch (networkOrTimeoutErr) {
      if (networkOrTimeoutErr instanceof Error) {
        if (networkOrTimeoutErr.message === 'Failed to fetch')
          throw new Error('Unable to reach server. Try again later.');
        else throw networkOrTimeoutErr;
      } else {
        throw networkOrTimeoutErr;
      }
    }

    const code = `${res.status}`;

    const status =
      code[0] === '2' ? 'success' : code[0] === '4' ? 'fail' : 'error';

    if (options.method === 'DELETE' && status === 'success')
      return { status: 'success', data: null } as APIResponseSuccess<T>;

    const data = options.skipResponseParse
      ? ({
          status,
          data: null,
        } as APIResponse<T>)
      : ((await res.json()) as APIResponse<T>);

    if (data.status === 'success') return data;
    else throw new Error(`${data.message} (${res.status})`);
  } catch (err) {
    throw err;
  }
};
