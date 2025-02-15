// Функция для использования React Suspense
export function createResource(asyncFunc) {
    let status = 'pending';
    let result;
    let suspender = asyncFunc()
        .then((res) => {
            status = 'success';
            result = res;
        })
        .catch((err) => {
            status = 'error';
            result = err;
        });

    return {
        read() {
            if (status === 'pending') {
                throw suspender; // This tells React Suspense to wait
            } else if (status === 'error') {
                throw result; // Let an error boundary handle this
            } else if (status === 'success') {
                return result;
            }
        },
    };
}