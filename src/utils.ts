
export function randomFn(len: number) {
    let options = "abcdefghijklmnopqrstubxyz01234567890";
    let lenn = options.length;

    let ans = "";
    for(let i = 0; i < len; i++) {
        ans += options[Math.floor(Math.random() * lenn)];
    }

    return ans;
}