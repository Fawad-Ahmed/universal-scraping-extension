const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const fs = require('fs');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';
    
    return {
        entry: {
            background: './src/background/index.js',
            'content-script': './src/content/content-script.js',
            popup: './src/popup/popup.js',
            standalone: './src/standalone/standalone.js'
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js',
            clean: true
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                            plugins: []
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: /\.(png|jpg|jpeg|gif|svg)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'images/[name][ext]'
                    }
                }
            ]
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    // Copy manifest
                    { 
                        from: 'public/manifest.json', 
                        to: 'manifest.json',
                        transform(content) {
                            // Update manifest for production
                            const manifest = JSON.parse(content.toString());
                            
                            if (isProduction) {
                                // Remove development-only permissions
                                manifest.permissions = manifest.permissions.filter(
                                    permission => permission !== 'webNavigation'
                                );
                            }
                            
                            return JSON.stringify(manifest, null, 2);
                        }
                    },
                    
                    // Copy HTML files
                    { 
                        from: 'src/popup/index.html', 
                        to: 'popup.html',
                        transform(content) {
                            // Minify HTML in production
                            if (isProduction) {
                                return content.toString()
                                    .replace(/\s+/g, ' ')
                                    .replace(/>\s</g, '><')
                                    .trim();
                            }
                            return content;
                        }
                    },
                    { 
                        from: 'src/standalone/standalone.html', 
                        to: 'standalone.html',
                        transform(content) {
                            if (isProduction) {
                                return content.toString()
                                    .replace(/\s+/g, ' ')
                                    .replace(/>\s</g, '><')
                                    .trim();
                            }
                            return content;
                        }
                    },
                    
                    // Copy CSS files
                    { from: 'src/popup/popup.css', to: 'popup.css' },
                    { from: 'src/content/content-style.css', to: 'content-style.css' },
                    
                    // Copy icons if they exist
                    {
                        from: 'public/icons',
                        to: 'icons',
                        noErrorOnMissing: true
                    },
                    
                    // Copy other assets
                    {
                        from: 'public/images',
                        to: 'images',
                        noErrorOnMissing: true
                    }
                ]
            })
        ],
        resolve: {
            extensions: ['.js', '.json'],
            alias: {
                '@': path.resolve(__dirname, 'src'),
                '@utils': path.resolve(__dirname, 'src/utils'),
                '@shared': path.resolve(__dirname, 'src/shared')
            }
        },
        optimization: {
            minimize: isProduction,
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                        enforce: true
                    },
                    common: {
                        name: 'common',
                        minChunks: 2,
                        chunks: 'all',
                        enforce: true
                    }
                }
            }
        },
        mode: isProduction ? 'production' : 'development',
        devtool: isProduction ? false : 'source-map',
        stats: {
            colors: true,
            modules: false,
            chunks: false,
            chunkModules: false,
            warnings: true,
            errors: true
        },
        performance: {
            hints: isProduction ? 'warning' : false,
            maxEntrypointSize: 512000,
            maxAssetSize: 512000
        },
        target: ['web', 'es2020'],
        experiments: {
            topLevelAwait: true
        }
    };
};