function selectAge(age) {
    localStorage.setItem("selectedAge", age);
    window.location.href = "categories";
}