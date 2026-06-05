import { IToastConfig, showToast } from "@/components/base/toast";

function success(message: string, config?: IToastConfig) {
    showToast({
        message,
        ...config,
        type: "success",
    });
}

function warn(message: string, config?: IToastConfig) {
    showToast({
        message,
        ...config,
        type: "warn",
    });
}

function error(message: string, config?: IToastConfig) {
    showToast({
        message,
        ...config,
        type: "error",
    });
}

const Toast = {
    success,
    warn,
    error,
};

export default Toast;
