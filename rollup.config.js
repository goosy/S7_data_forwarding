import pkg from './package.json' assert { type: 'json' };
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default [{
    input: 'src/index.js',
    output: [{
        file: pkg.exports.default,
        format: 'es',
    }],
    plugins: [
        resolve({ preferBuiltins: true }),
        commonjs(),
    ],
}, {
    input: 'src/cli.js',
    output: [{
        file: pkg.exports.cli,
        format: 'es',
    }],
    plugins: [
        resolve({ preferBuiltins: true }),
        json()
    ],
}]
