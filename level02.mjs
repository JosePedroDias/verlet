export default {
    dropEverySecs: 5,
    size: [2, 1],
    barrierCfgs: [
        [[-1, -1], [0]],
        [[ 0, -1], [0]],

        [[-2,  0], [1]],
        [[ 2,  0], [2]],
        [[ 0,  0], [1]],

        [[-2,  1], [0, 2]],
        [[-1,  1], [0]],
        [[ 0,  1], [0]],
        [[ 1,  1], [1]],
    ],
    goals: [
        [ 0, -1]
    ],
};
