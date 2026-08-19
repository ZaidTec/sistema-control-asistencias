import { useEffect, useState } from "react";


function useIsMobile(breakpoint = 768) {

    const [esMovil, setEsMovil] = useState(
        () =>
            window.matchMedia(
                `(max-width: ${breakpoint}px)`
            ).matches
    );


    useEffect(() => {

        const mql = window.matchMedia(
            `(max-width: ${breakpoint}px)`
        );

        const onChange = (e) => setEsMovil(e.matches);

        mql.addEventListener("change", onChange);

        return () =>
            mql.removeEventListener("change", onChange);

    }, [breakpoint]);


    return esMovil;

}


export default useIsMobile;