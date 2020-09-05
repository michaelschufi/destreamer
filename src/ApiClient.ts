import { logger } from './Logger';
import { Session } from './Types';

import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance, AxiosError } from 'axios';
import axiosRetry, { isNetworkOrIdempotentRequestError } from 'axios-retry';


export class ApiClient {
    private static instance: ApiClient;
    private axiosInstance?: AxiosInstance;
    private session?: Session;

    private constructor(session?: Session) {
        this.session = session;
        this.axiosInstance = axios.create({
            baseURL: session?.ApiGatewayUri,
            // timeout: 7000,
            headers: { 'User-Agent': 'destreamer/3.0 (beta)' }
        });

        axiosRetry(this.axiosInstance, {
            // The following option is not working.
            // We should open an issue on the relative GitHub
            shouldResetTimeout: true,
            retries: 6,
            retryDelay: (retryCount: number) => {
                return retryCount * 2000;
            },
            retryCondition: (err: AxiosError) => {
                const retryCodes: Array<number> = [429, 500, 502, 503];
                if (isNetworkOrIdempotentRequestError(err)) {
                    logger.warn(`${err}. Retrying request...`);

                    return true;
                }
                logger.warn(`Got HTTP code ${err?.response?.status ?? undefined}. Retrying request...`);

                const shouldRetry: boolean = retryCodes.includes(err?.response?.status ?? 0);

                return shouldRetry;
            }
        });
    }

    public static getInstance(session?: Session): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient(session);
        }

        return ApiClient.instance;
    }

    /**
     * Call Microsoft Stream API. Base URL is sourced from
     * the session object and prepended automatically.
     */
    public async callApi(
        path: string,
        method: AxiosRequestConfig['method'] = 'get',
        payload?: any): Promise<AxiosResponse | undefined> {

        const delimiter: '?' | '&' = path.split('?').length === 1 ? '?' : '&';

        const headers: object = {
            'Authorization': 'Bearer ' + this.session?.AccessToken
        };

        return this.axiosInstance?.request({
            method: method,
            headers: headers,
            data: payload ?? undefined,
            url: path + delimiter + 'api-version=' + this.session?.ApiGatewayVersion
        });
    }

    /**
     * Call an absolute URL
     */
    public async callUrl(
        url: string,
        method: AxiosRequestConfig['method'] = 'get',
        payload?: any,
        responseType: AxiosRequestConfig['responseType'] = 'json'): Promise<AxiosResponse | undefined> {

        const headers: object = {
            'Authorization': 'Bearer ' + this.session?.AccessToken
        };

        logger.debug(
            'url: ' + url + '\n' +
            'method: ' + method + '\n' +
            'payload: ' + payload + '\n' +
            'responseType: ' + responseType + '\n'
        );

        return this.axiosInstance?.request({
            method: method,
            headers: headers,
            data: payload ?? undefined,
            url: url,
            responseType: responseType
        });
    }
}
