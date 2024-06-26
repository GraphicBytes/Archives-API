import axios from 'axios';

export async function AxiosPOST(postData, endpoint) {
    try {
        const axiosInstance = axios.create({
            withCredentials: true,
            credentials: 'include',
        });

        const response = await axiosInstance.post(endpoint, postData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...axiosInstance.defaults.headers.common,
            },
        });

        return response.data.status === 1;
    } catch (error) {
        console.error('Error:', error);
        return error;
    }
}