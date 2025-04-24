const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx', // Change to .tsx entry point
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devtool: 'source-map', // For debugging with breakpoints
  target: 'web',
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Match both .ts and .tsx files
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader', // Use ts-loader for TypeScript + JSX
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'], // Add .tsx to resolved extensions
  },
};
