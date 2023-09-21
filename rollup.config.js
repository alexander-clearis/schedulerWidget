
export default args => {
    const result = args.configDefaultConfig;

    result.forEach(config => {
        config.context = 'window';
        config.moduleContext = 'window';

        const defaultOnWarn = config.onwarn;

        config.onwarn = warning => {
            if (warning.code === "THIS_IS_UNDEFINED" || warning.code === "SOURCEMAP_ERROR") {
              return;
            }
            if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                return
            }
            defaultOnWarn(warning);
        };

        const plugins = config.plugins || [];


        config.plugins = [...plugins]


    });


    return result;
};