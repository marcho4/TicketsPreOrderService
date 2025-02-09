


export default function Header() {
    return (
        <nav className="flex z-40 w-full h-auto items-center justify-center sticky top-0 inset-x-0 border-b backdrop-blur-lg data-[menu-open=true]:backdrop-blur-xl backdrop-saturate-150 bg-background/70 border-default-100 data-[menu-open=true]:border-solid">
            <header className="z-40 flex gap-4 flex-row relative flex-nowrap items-center h-[var(--navbar-height)] w-full justify-center bg-transparent max-w-screen-xl px-5">
                <div
                    className="flex basis-0 flex-row flex-grow flex-nowrap justify-start bg-transparent items-center no-underline text-medium whitespace-nowrap box-border">
                    <a aria-label="Home" href="/" className="hover:text-inherit hover:opacity-100 text-inherit [&amp;>svg]:w-[108px]
                        min-[340px]:[&amp;>svg]:w-[135px] mt-2">
                        <svg width="135" height="32" viewBox="0 0 4614 1100" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M0.498047 842.208V262.505H133.728L147.752 371.199C168.789 333.799 197.226 304.189 233.066 282.374C269.686 259.777 312.537 248.48 361.622 248.48V406.262H319.549C286.826 406.262 257.609 411.327 231.898 421.456C206.186 431.584 185.929 449.115 171.126 474.05C157.102 498.984 150.09 533.656 150.09 578.069V842.208H0.498047ZM964.06 262.505V842.208H831.999L820.312 744.033C802.391 778.317 776.292 805.586 742.01 825.846C708.509 846.105 668.773 856.233 622.804 856.233C551.124 856.233 495.418 833.636 455.682 788.445C415.947 743.254 396.079 677.023 396.079 589.757V262.505H545.671V575.732C545.671 625.597 555.799 663.779 576.057 690.27C596.315 716.76 627.87 730.007 670.72 730.007C712.793 730.007 747.075 715.204 773.564 685.595C800.835 655.985 814.468 614.691 814.468 561.706V262.505H964.06ZM1401.61 856.233C1357.98 856.233 1319.8 848.052 1287.08 831.689C1254.36 815.327 1227.87 792.342 1207.61 762.733L1191.25 842.208H1058.02V0.703125H1207.61V345.486C1226.31 319.774 1250.85 297.177 1281.24 277.699C1312.4 258.219 1352.53 248.48 1401.61 248.48C1456.15 248.48 1504.85 261.726 1547.7 288.217C1590.55 314.708 1624.44 350.94 1649.37 396.912C1674.31 442.884 1686.77 495.087 1686.77 553.525C1686.77 611.963 1674.31 664.166 1649.37 710.139C1624.44 755.329 1590.55 791.173 1547.7 817.664C1504.85 843.377 1456.15 856.233 1401.61 856.233ZM1370.06 725.332C1417.59 725.332 1456.93 709.36 1488.09 677.413C1519.26 645.466 1534.84 604.172 1534.84 553.525C1534.84 502.878 1519.26 461.193 1488.09 428.468C1456.93 395.743 1417.59 379.38 1370.06 379.38C1321.75 379.38 1282.02 395.743 1250.85 428.468C1220.47 460.415 1205.27 501.709 1205.27 552.356C1205.27 603.004 1220.47 644.688 1250.85 677.413C1282.02 709.36 1321.75 725.332 1370.06 725.332ZM1781.93 1099.33L1916.33 803.639H1881.27L1655.71 262.505H1818.16L1980.61 670.401L2150.07 262.505H2309.01L1940.87 1099.33H1781.93ZM2568.41 842.208V0.703125H2718V842.208H2568.41ZM3012.25 856.233C2962.4 856.233 2921.49 848.442 2889.55 832.858C2857.6 816.495 2833.84 795.067 2818.26 768.576C2802.68 742.086 2794.89 712.867 2794.89 680.92C2794.89 627.157 2815.92 583.522 2858 550.019C2900.07 516.516 2963.18 499.762 3047.31 499.762H3194.57V485.737C3194.57 446 3183.28 416.781 3160.68 398.081C3138.1 379.38 3110.05 370.03 3076.53 370.03C3046.14 370.03 3019.66 377.433 2997.06 392.237C2974.47 406.262 2960.45 427.299 2955 455.35H2808.91C2812.8 413.274 2826.83 376.652 2850.98 345.486C2875.91 314.321 2907.86 290.555 2946.82 274.192C2985.77 257.051 3029.41 248.48 3077.7 248.48C3160.31 248.48 3225.35 269.128 3272.87 310.424C3320.42 351.721 3344.16 410.159 3344.16 485.737V842.208H3216.77L3202.75 748.708C3185.62 779.873 3161.47 805.586 3130.29 825.846C3099.9 846.105 3060.57 856.233 3012.25 856.233ZM3046.14 739.357C3089.02 739.357 3122.11 725.332 3145.48 697.282C3169.66 669.232 3184.85 634.56 3191.06 593.263H3063.67C3023.94 593.263 2995.52 600.666 2978.37 615.469C2961.23 629.494 2952.66 647.026 2952.66 668.063C2952.66 690.66 2961.23 708.192 2978.37 720.657C2995.52 733.123 3018.1 739.357 3046.14 739.357ZM3772.08 856.233C3728.44 856.233 3690.27 848.052 3657.55 831.689C3624.83 815.327 3598.35 792.342 3578.08 762.733L3561.72 842.208H3428.49V0.703125H3578.08V345.486C3596.78 319.774 3621.32 297.177 3651.71 277.699C3682.86 258.219 3723 248.48 3772.08 248.48C3826.61 248.48 3875.33 261.726 3918.17 288.217C3961.01 314.708 3994.9 350.94 4019.84 396.912C4044.78 442.884 4057.24 495.087 4057.24 553.525C4057.24 611.963 4044.78 664.166 4019.84 710.139C3994.9 755.329 3961.01 791.173 3918.17 817.664C3875.33 843.377 3826.61 856.233 3772.08 856.233ZM3740.53 725.332C3788.04 725.332 3827.41 709.36 3858.56 677.413C3889.72 645.466 3905.31 604.172 3905.31 553.525C3905.31 502.878 3889.72 461.193 3858.56 428.468C3827.41 395.743 3788.04 379.38 3740.53 379.38C3692.21 379.38 3652.48 395.743 3621.32 428.468C3590.94 460.415 3575.74 501.709 3575.74 552.356C3575.74 603.004 3590.94 644.688 3621.32 677.413C3652.48 709.36 3692.21 725.332 3740.53 725.332ZM4372.02 856.233C4320.59 856.233 4275.42 848.052 4236.45 831.689C4197.48 814.549 4166.33 791.173 4142.95 761.564C4119.58 731.954 4105.56 697.673 4100.88 658.713H4251.64C4256.32 681.31 4268.77 700.789 4289.04 717.151C4310.08 732.736 4336.96 740.526 4369.68 740.526C4402.4 740.526 4426.18 733.904 4440.97 720.657C4456.56 707.41 4464.34 692.217 4464.34 675.076C4464.34 650.141 4453.42 633.391 4431.62 624.819C4409.81 615.469 4379.43 606.51 4340.46 597.938C4315.52 592.485 4290.21 585.86 4264.5 578.069C4238.79 570.278 4215.01 560.538 4193.21 548.85C4172.17 536.384 4155.04 520.8 4141.79 502.1C4128.53 482.622 4121.92 458.856 4121.92 430.806C4121.92 379.38 4142.19 336.136 4182.69 301.074C4223.99 266.011 4281.63 248.48 4355.65 248.48C4424.21 248.48 4478.77 264.453 4519.27 296.399C4560.57 328.346 4585.12 372.368 4592.9 428.468H4451.49C4442.91 385.615 4410.58 364.187 4354.49 364.187C4326.44 364.187 4304.63 369.64 4289.04 380.549C4274.25 391.459 4266.83 405.093 4266.83 421.456C4266.83 438.596 4278.12 452.234 4300.73 462.362C4323.33 472.49 4353.32 481.84 4390.71 490.412C4431.22 499.762 4468.25 510.281 4501.74 521.969C4536.03 532.878 4563.28 549.628 4583.55 572.225C4603.81 594.041 4613.93 625.597 4613.93 666.895C4614.7 702.735 4605.35 735.073 4585.88 763.901C4566.42 792.73 4538.37 815.327 4501.74 831.689C4465.11 848.052 4421.87 856.233 4372.02 856.233Z"
                                fill="currentColor"></path>
                        </svg>
                    </a>
                </div>
                <ul className="flex-row flex-nowrap items-center data-[justify=start]:justify-start data-[justify=start]:flex-grow data-[justify=start]:basis-0 data-[justify=center]:justify-center data-[justify=end]:justify-end data-[justify=end]:flex-grow data-[justify=end]:basis-0 hidden h-11 gap-4 rounded-full border-small border-default-200/20 bg-background/60 px-4 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50 md:flex"
                    data-justify="center">
                    <li className="text-medium whitespace-nowrap box-border list-none data-[active=true]:font-semibold hidden md:flex"
                        data-active="true"><a href="/"
                                              className="relative inline-flex items-center !text-small no-underline hover:opacity-80 active:opacity-disabled transition-opacity dark:hover:opacity-100 text-foreground hover:text-foreground">Home</a>
                    </li>
                    <li className="text-medium whitespace-nowrap box-border list-none data-[active=true]:font-semibold hidden md:flex">
                        <a href="/careers"
                           className="relative inline-flex items-center !text-small no-underline hover:opacity-80 active:opacity-disabled transition-opacity text-default-600 hover:text-default-500 dark:hover:opacity-100">Careers</a>
                    </li>
                    <li className="text-medium whitespace-nowrap box-border list-none data-[active=true]:font-semibold hidden md:flex">
                        <a href="/become-a-co-founder"
                           className="relative inline-flex items-center !text-small no-underline hover:opacity-80 active:opacity-disabled transition-opacity text-default-600 hover:text-default-500 dark:hover:opacity-100">Become
                            a Co-Founder</a></li>
                    <li className="text-medium whitespace-nowrap box-border list-none data-[active=true]:font-semibold hidden md:flex">
                        <a href="/about-us"
                           className="relative inline-flex items-center !text-small no-underline hover:opacity-80 active:opacity-disabled transition-opacity text-default-600 hover:text-default-500 dark:hover:opacity-100">About
                            Us</a></li>
                </ul>
                <ul className="flex gap-4 h-full flex-row flex-nowrap items-center data-[justify=start]:justify-start data-[justify=start]:flex-grow data-[justify=start]:basis-0 data-[justify=center]:justify-center data-[justify=end]:justify-end data-[justify=end]:flex-grow data-[justify=end]:basis-0"
                    data-justify="end">
                    <li className="text-medium whitespace-nowrap box-border list-none data-[active=true]:font-semibold hidden md:flex ml-2 !flex gap-2 items-center">
                        <a href="/careers"
                           className="z-0 group relative items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 px-4 min-w-20 h-10 text-small gap-2 rounded-full [&amp;>svg]:max-w-[theme(spacing.8)] data-[pressed=true]:scale-[0.97] transition-transform-colors-opacity motion-reduce:transition-none data-[hover=true]:opacity-hover flex border-small border-primary-500/20 bg-primary-500/10 text-primary-800"
                           // style="box-shadow: rgba(148, 177, 243, 0.43) 0px 0px 4px inset;"
                        >Careers
                            <div className="w-4 h-4 mt-px group-hover:translate-x-1 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd"
                                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                          clipRule="evenodd"></path>
                                </svg>
                            </div>
                        </a></li>
                </ul>
                <button
                    className="group flex items-center justify-center w-6 h-full rounded-small tap-highlight-transparent outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 text-default-600 hover:text-default-500 lg:hidden"
                    type="button" aria-pressed="false"><span className="sr-only">open navigation menu</span><span
                    className="w-full h-full pointer-events-none flex flex-col items-center justify-center text-inherit group-data-[pressed=true]:opacity-70 transition-opacity before:content-[''] before:block before:h-px before:w-6 before:bg-current before:transition-transform before:duration-150 before:-translate-y-1 before:rotate-0 group-data-[open=true]:before:translate-y-px group-data-[open=true]:before:rotate-45 after:content-[''] after:block after:h-px after:w-6 after:bg-current after:transition-transform after:duration-150 after:translate-y-1 after:rotate-0 group-data-[open=true]:after:translate-y-0 group-data-[open=true]:after:-rotate-45"></span>
                </button>
            </header>
        </nav>
    )
}