const Notify = {

    success(title, text = "") {
        return Swal.fire({
            icon: "success",
            title,
            text,
            background: "#FDFBFC",
            color: "#6C6C6A",
            confirmButtonColor: "#E8CCD8",
            confirmButtonText: "Хорошо",
            customClass: {
                popup: "cute-popup",
                confirmButton: "cute-button"
            }
        });
    },

    error(title, text = "") {
        return Swal.fire({
            icon: "error",
            title,
            text,
            background: "#FDFBFC",
            color: "#6C6C6A",
            confirmButtonColor: "#E8CCD8",
            confirmButtonText: "Закрыть",
            customClass: {
                popup: "cute-popup",
                confirmButton: "cute-button"
            }
        });
    },

    warning(title, text = "") {
        return Swal.fire({
            icon: "warning",
            title,
            text,
            background: "#FDFBFC",
            color: "#6C6C6A",
            confirmButtonColor: "#E8CCD8",
            confirmButtonText: "Понятно",
            customClass: {
                popup: "cute-popup",
                confirmButton: "cute-button"
            }
        });
    },

    info(title, text = "") {
        return Swal.fire({
            icon: "info",
            title,
            text,
            background: "#FDFBFC",
            color: "#6C6C6A",
            confirmButtonColor: "#E8CCD8",
            confirmButtonText: "ОК",
            customClass: {
                popup: "cute-popup",
                confirmButton: "cute-button"
            }
        });
    },

    async confirm(title, text = "") {
        return await Swal.fire({
            icon: "question",
            title,
            text,
            background: "#FDFBFC",
            color: "#6C6C6A",
            showCancelButton: true,
            confirmButtonColor: "#E8CCD8",
            cancelButtonColor: "#6C6C6A",
            confirmButtonText: "Да",
            cancelButtonText: "Нет",
            customClass: {
                popup: "cute-popup",
                confirmButton: "cute-button",
                cancelButton: "cute-button"
            }
        });
    }
};
