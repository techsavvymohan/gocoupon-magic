/**
 * @file store-logo-resolver.ts
 * @description Zero-mismatch brand logo resolver for GoCoupon.
 *
 * Strategies:
 * 1. High-resolution local SVG/WebP vector assets for enterprise partners (Flipkart, Amazon, Myntra, Tata CLiQ, etc.)
 * 2. Exact merchant domain extraction directly from partner tracking redirect URLs (eliminating name collision/mismatch)
 * 3. Google S2 128px HD Favicon CDN for authentic brand favicons/icons
 * 4. Deterministic branded gradient monogram avatar fallback for network/load failures
 */

export const CLOUDINARY_STORE_LOGOS: Record<string, string> = {
  "aliexpress": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745870/gocoupon/brands/brand_aliexpress.png",
  "aliexpressww": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745870/gocoupon/brands/brand_aliexpress.png",
  "aliexpress-ww": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745870/gocoupon/brands/brand_aliexpress.png",
  "bytepe": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060843/gocoupon/brands/real_brand_bytepe.svg",
  "dyson": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060830/gocoupon/brands/real_brand_dyson.svg",
  "hackdaily": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060298/gocoupon/brands/real_brand_hackdaily.png",
  "answear": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060297/gocoupon/brands/real_brand_answear.png",
  "brevo": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060295/gocoupon/brands/real_brand_brevo.png",
  "turkishairlines": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060293/gocoupon/brands/real_brand_turkishairlines.svg",
  "sangeethamobile": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745823/gocoupon/brands/brand_sangeetha-mobile.png",
  "allman": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745814/gocoupon/brands/brand_all-man.png",
  "worldofasaya": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745813/gocoupon/brands/brand_world-of-asaya.png",
  "temptationexperience": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745900/gocoupon/brands/brand_temptation-experience.png",
  "wolfandbadger": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745838/gocoupon/brands/brand_wolf-and-badger.png",
  "marksandspencer": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745864/gocoupon/brands/brand_marks-and-spencer.png",
  "organicmandya": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745898/gocoupon/brands/brand_organic-mandya.png",
  "kingdomofwhite": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745897/gocoupon/brands/brand_kingdom-of-white.png",
  "zenhotels": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745897/gocoupon/brands/brand_zen-hotels.png",
  "corelroxiopinnaclemultimediasoftware": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745896/gocoupon/brands/brand_corel-roxio-pinnacle-multimedia-software.png",
  "zanducare": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745863/gocoupon/brands/brand_zandu-care.png",
  "reclaimai": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745822/gocoupon/brands/brand_reclaim-ai.png",
  "my": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745861/gocoupon/brands/brand_my-designation.png",
  "mydesignation": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745861/gocoupon/brands/brand_my-designation.png",
  "angarain": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745822/gocoupon/brands/brand_angara-in.png",
  "comfortzone": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745861/gocoupon/brands/brand_comfort-zone.png",
  "jaipurrugs": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745837/gocoupon/brands/brand_jaipur-rugs.png",
  "thewalletstore": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060081/gocoupon/brands/real_brand_thewalletstore.png",
  "ezeperfume": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745890/gocoupon/brands/brand_eze-perfume.png",
  "kraftedmillets": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745860/gocoupon/brands/brand_krafted-millets.png",
  "steadfastnutrition": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745889/gocoupon/brands/brand_steadfast-nutrition.png",
  "bigmuscles": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745835/gocoupon/brands/brand_big-muscles.png",
  "miniwesst": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745855/gocoupon/brands/brand_mini-wesst.png",
  "oliveyoungglobal": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745858/gocoupon/brands/brand_olive-young-global.png",
  "asaptickets": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745887/gocoupon/brands/brand_asap-tickets.png",
  "onspaceai": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745855/gocoupon/brands/brand_onspace-ai.png",
  "worldofwarships": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745854/gocoupon/brands/brand_world-of-warships.png",
  "controlzworld": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745886/gocoupon/brands/brand_controlz-world.png",
  "kickscrew": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745833/gocoupon/brands/brand_kicks-crew.png",
  "asus": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745800/gocoupon/brands/brand_asus.png",
  "asusindia": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745800/gocoupon/brands/brand_asus.png",
  "forest": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745832/gocoupon/brands/brand_forest-essentials.png",
  "forestessentials": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745832/gocoupon/brands/brand_forest-essentials.png",
  "plumgoodness": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745812/gocoupon/brands/brand_plum-goodness.png",
  "indulgeo": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745886/gocoupon/brands/brand_indulgeo-essentials.png",
  "indulgeoessentials": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745886/gocoupon/brands/brand_indulgeo-essentials.png",
  "jeenasikho": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745885/gocoupon/brands/brand_jeena-sikho.png",
  "krispai": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745832/gocoupon/brands/brand_krisp-ai.png",
  "solaracps": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745832/gocoupon/brands/brand_solara-cps.png",
  "siderai": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745827/gocoupon/brands/brand_sider-ai.png",
  "baccabucci": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745819/gocoupon/brands/brand_bacca-bucci.png",
  "travisperkins": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745791/gocoupon/brands/brand_travis-perkins-uk.png",
  "travisperkinsuk": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745791/gocoupon/brands/brand_travis-perkins-uk.png",
  "itchotels": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745819/gocoupon/brands/brand_itc-hotels.png",
  "kenazperfumes": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745819/gocoupon/brands/brand_kenaz-perfumes.png",
  "snowfireai": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745885/gocoupon/brands/brand_snowfire-ai.png",
  "namecheap": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745811/gocoupon/brands/brand_namecheap-us.png",
  "namecheapus": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745811/gocoupon/brands/brand_namecheap-us.png",
  "switcherstudio": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745818/gocoupon/brands/brand_switcher-studio.png",
  "razercps": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745800/gocoupon/brands/brand_razer-cps.png",
  "kospetsmartwatch": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745827/gocoupon/brands/brand_kospet-smartwatch.png",
  "letsbeco": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745810/gocoupon/brands/brand_lets-beco.png",
  "bingemoviestv": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745830/gocoupon/brands/brand_binge-movies-tv.png",
  "titanskinn": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745804/gocoupon/brands/brand_titan-skinn.png",
  "blabliblu": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745818/gocoupon/brands/brand_bla-bli-blu.png",
  "testbrandstore": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060079/gocoupon/brands/real_brand_testbrandstore.png",
  "newcommunitybrand": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060075/gocoupon/brands/real_brand_newcommunitybrand.svg",
  "testbrand": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060066/gocoupon/brands/real_brand_testbrand.svg",
  "asitisnutrition": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060063/gocoupon/brands/real_brand_asitisnutrition.svg",
  "nakpronutrition": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060060/gocoupon/brands/real_brand_nakpronutrition.svg",
  "theformalclub": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745834/gocoupon/brands/brand_the-formal-club.png",
  "kleenest": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060842/gocoupon/brands/real_brand_kleenest.png",
  "oliveboard": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060053/gocoupon/brands/real_brand_oliveboard.png",
  "sarkarperfumes": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060051/gocoupon/brands/real_brand_sarkarperfumes.jpg",
  "sadaa": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060049/gocoupon/brands/real_brand_sadaa.png",
  "replyio": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745809/gocoupon/brands/brand_reply-io.png",
  "thetrost": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745882/gocoupon/brands/brand_the-trost.png",
  "vedaoils": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745882/gocoupon/brands/brand_veda-oils.jpg",
  "floweraura": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745809/gocoupon/brands/brand_flower-aura.png",
  "pandasbox": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745809/gocoupon/brands/brand_pandas-box.png",
  "lifepro": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745817/gocoupon/brands/brand_lifepro-us.png",
  "lifeprous": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745817/gocoupon/brands/brand_lifepro-us.png",
  "rforrabbit": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745845/gocoupon/brands/brand_r-for-rabbit.jpg",
  "traveloka": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745826/gocoupon/brands/brand_traveloka.png",
  "travelokaindia": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745826/gocoupon/brands/brand_traveloka.png",
  "livingshapes": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745879/gocoupon/brands/brand_living-shapes.png",
  "airalo": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745879/gocoupon/brands/brand_airalo-ww.jpg",
  "airaloww": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745879/gocoupon/brands/brand_airalo-ww.jpg",
  "ulike": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745877/gocoupon/brands/brand_ulike-de.png",
  "ulikede": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745877/gocoupon/brands/brand_ulike-de.png",
  "voyageeyewear": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745800/gocoupon/brands/brand_voyage-eyewear.png",
  "indiangiftsportal": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745803/gocoupon/brands/brand_indian-gifts-portal.png",
  "oglmove": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745799/gocoupon/brands/brand_ogl-move.png",
  "bookingcom": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057658/gocoupon/brands/brand_booking.png",
  "domaincom": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745849/gocoupon/brands/brand_domain-com.png",
  "doodhvalefarms": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745807/gocoupon/brands/brand_doodhvale-farms.png",
  "helium10": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745841/gocoupon/brands/brand_helium-10.png",
  "pepejeans": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745814/gocoupon/brands/brand_pepe-jeans.png",
  "fullshine": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745876/gocoupon/brands/brand_full-shine.png",
  "thebearhouse": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745873/gocoupon/brands/brand_the-bear-house.png",
  "one": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745873/gocoupon/brands/brand_one-india-mall.png",
  "oneindiamall": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745873/gocoupon/brands/brand_one-india-mall.png",
  "hokmakeup": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745799/gocoupon/brands/brand_hok-makeup.png",
  "flyfairly": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745797/gocoupon/brands/brand_fly-fairly.png",
  "123reg": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060046/gocoupon/brands/real_brand_123reg.svg",
  "3ina": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060044/gocoupon/brands/real_brand_3ina.png",
  "dreampairsbrunomarcnortiv8shoes": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060042/gocoupon/brands/real_brand_dreampairsbrunomarcnortiv8shoe.svg",
  "dreampairsbrunomarcampnortiv8shoes": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060042/gocoupon/brands/real_brand_dreampairsbrunomarcnortiv8shoe.svg",
  "mexrentacar": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060037/gocoupon/brands/real_brand_mexrentacar.png",
  "tikibrandtorchesfirepitsfuelaccessories": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060035/gocoupon/brands/real_brand_tikibrandtorchesfirepitsfuelac.svg",
  "tikibrandtorchesfirepitsfuelampaccessories": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060035/gocoupon/brands/real_brand_tikibrandtorchesfirepitsfuelac.svg",
  "adblockultimatenet": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060031/gocoupon/brands/real_brand_adblockultimatenet.svg",
  "caribbean": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060026/gocoupon/brands/real_brand_caribbean.svg",
  "caribbeanaffiliateprogram": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060026/gocoupon/brands/real_brand_caribbean.svg",
  "contactsdirect": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060024/gocoupon/brands/real_brand_contactsdirect.svg",
  "contactsdirectaffiliateprogram": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060024/gocoupon/brands/real_brand_contactsdirect.svg",
  "agatinsvetcz": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060019/gocoupon/brands/real_brand_agatinsvetcz.svg",
  "austinair": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060014/gocoupon/brands/real_brand_austinair.png",
  "turkishairlineseu": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060011/gocoupon/brands/real_brand_turkishairlineseu.svg",
  "turkishairlineseuampint": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060011/gocoupon/brands/real_brand_turkishairlineseu.svg",
  "turkishairlinesamericas": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060006/gocoupon/brands/real_brand_turkishairlinesamericas.svg",
  "allegropl": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060003/gocoupon/brands/real_brand_allegropl.png",
  "allpowers": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060001/gocoupon/brands/real_brand_allpowers.png",
  "amiclubwear": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059999/gocoupon/brands/real_brand_amiclubwear.png",
  "amoremall": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059997/gocoupon/brands/real_brand_amoremall.png",
  "goldenmineandjewelryvortex": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059995/gocoupon/brands/real_brand_goldenmineandjewelryvortex.svg",
  "scripcompaniesmassagechiropractorandmedicalsupply": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059991/gocoupon/brands/real_brand_scripcompaniesmassagechiroprac.svg",
  "trampolinepartsandsupply": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059986/gocoupon/brands/real_brand_trampolinepartsandsupply.png",
  "andaseat": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059985/gocoupon/brands/real_brand_andaseat.png",
  "monicaandy": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060838/gocoupon/brands/real_brand_monicaandy.svg",
  "ansi": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059979/gocoupon/brands/real_brand_ansi.png",
  "answearhr": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059976/gocoupon/brands/real_brand_answearhr.svg",
  "answearhu": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059971/gocoupon/brands/real_brand_answearhu.svg",
  "answearsi": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059966/gocoupon/brands/real_brand_answearsi.svg",
  "aomei": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059960/gocoupon/brands/real_brand_aomei.svg",
  "aosomcom": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059952/gocoupon/brands/real_brand_aosomcom.svg",
  "havaianas": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059947/gocoupon/brands/real_brand_havaianas.png",
  "havaianasapac": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059947/gocoupon/brands/real_brand_havaianas.png",
  "netart": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059945/gocoupon/brands/real_brand_netart.png",
  "netartapac": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059945/gocoupon/brands/real_brand_netart.png",
  "apodemia": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059943/gocoupon/brands/real_brand_apodemia.png",
  "apodemiaes": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059943/gocoupon/brands/real_brand_apodemia.png",
  "apohealthde": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059941/gocoupon/brands/real_brand_apohealthde.jpg",
  "philipshomeappliances": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059938/gocoupon/brands/real_brand_philipshomeappliances.svg",
  "philipshomeappliancescz": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059938/gocoupon/brands/real_brand_philipshomeappliances.svg",
  "arangrant": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059935/gocoupon/brands/real_brand_arangrant.png",
  "elizabetharden": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059933/gocoupon/brands/real_brand_elizabetharden.svg",
  "arka": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059929/gocoupon/brands/real_brand_arka.svg",
  "earmyshopcz": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059925/gocoupon/brands/real_brand_earmyshopcz.svg",
  "arsynlrx": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059920/gocoupon/brands/real_brand_arsynlrx.svg",
  "shuuemuraartofhair": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059914/gocoupon/brands/real_brand_shuuemuraartofhair.svg",
  "ashampoo": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059909/gocoupon/brands/real_brand_ashampoo.svg",
  "ashampooint": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059909/gocoupon/brands/real_brand_ashampoo.svg",
  "ashford": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059906/gocoupon/brands/real_brand_ashford.svg",
  "amazon": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057616/gocoupon/brands/brand_amazon.webp",
  "flipkart": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057540/gocoupon/brands/brand_flipkart.webp",
  "myntra": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057618/gocoupon/brands/brand_myntra.webp",
  "boat": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745796/gocoupon/brands/brand_boat.jpg",
  "croma": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057619/gocoupon/brands/brand_croma.svg",
  "tatacliq": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057624/gocoupon/brands/brand_tatacliq.webp",
  "ajio": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057625/gocoupon/brands/brand_ajio.webp",
  "nykaa": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057626/gocoupon/brands/brand_nykaa.webp",
  "meesho": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057627/gocoupon/brands/brand_meesho.webp",
  "reliance": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057621/gocoupon/brands/brand_reliance.svg",
  "snitch": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057648/gocoupon/brands/brand_snitch.png",
  "swiggy": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057650/gocoupon/brands/brand_swiggy.png",
  "zomato": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060829/gocoupon/brands/real_brand_zomato.svg",
  "firstcry": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057628/gocoupon/brands/brand_firstcry.webp",
  "noise": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057630/gocoupon/brands/brand_noise.svg",
  "mamaearth": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057655/gocoupon/brands/brand_mamaearth.png",
  "bewakoof": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745785/gocoupon/brands/brand_bewakoof.png",
  "thesouledstore": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057656/gocoupon/brands/brand_thesouledstore.png",
  "flixbus": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057657/gocoupon/brands/brand_flixbus.png",
  "medibuddy": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745875/gocoupon/brands/brand_medibuddy.png",
  "booking": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057658/gocoupon/brands/brand_booking.png",
  "jbl": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057660/gocoupon/brands/brand_jbl.png",
  "ajiogram": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057625/gocoupon/brands/brand_ajio.webp",
  "nykaabeauty": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057626/gocoupon/brands/brand_nykaa.webp",
  "nykaafashion": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057626/gocoupon/brands/brand_nykaa.webp",
  "reliancedigital": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057621/gocoupon/brands/brand_reliance.svg",
  "walmart": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059097/gocoupon/brands/real_brand_walmart.svg",
  "walmart-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059097/gocoupon/brands/real_brand_walmart.svg",
  "ebay": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059100/gocoupon/brands/real_brand_ebay.svg",
  "ebay-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059100/gocoupon/brands/real_brand_ebay.svg",
  "nike": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059098/gocoupon/brands/real_brand_nike.svg",
  "nike-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059098/gocoupon/brands/real_brand_nike.svg",
  "sephora": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059102/gocoupon/brands/real_brand_sephora.svg",
  "sephora-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059102/gocoupon/brands/real_brand_sephora.svg",
  "makemytrip": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059104/gocoupon/brands/real_brand_makemytrip.svg",
  "makemytrip-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059104/gocoupon/brands/real_brand_makemytrip.svg",
  "dominos": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059105/gocoupon/brands/real_brand_dominos.svg",
  "dominos-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059105/gocoupon/brands/real_brand_dominos.svg",
  "cleartrip": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059109/gocoupon/brands/real_brand_cleartrip.svg",
  "cleartrip-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059109/gocoupon/brands/real_brand_cleartrip.svg",
  "alibaba": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059111/gocoupon/brands/real_brand_alibaba.svg",
  "alibaba-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059111/gocoupon/brands/real_brand_alibaba.svg",
  "raynatours": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059114/gocoupon/brands/real_brand_raynatours.png",
  "raynatours-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059114/gocoupon/brands/real_brand_raynatours.png",
  "gstarraw": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059115/gocoupon/brands/real_brand_gstarraw.svg",
  "g-star-raw-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059115/gocoupon/brands/real_brand_gstarraw.svg",
  "mamaspapas": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058484/gocoupon/brands/brand_mamasandpapas.png",
  "mamasandpapas": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059117/gocoupon/brands/real_brand_mamasandpapas.png",
  "mamasandpapas-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059117/gocoupon/brands/real_brand_mamasandpapas.png",
  "svastika": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059118/gocoupon/brands/real_brand_svastika.svg",
  "qntsportsindia": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060841/gocoupon/brands/real_brand_qntsports.png",
  "qntsports": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059120/gocoupon/brands/real_brand_qntsports.svg",
  "qnt-sports": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059120/gocoupon/brands/real_brand_qntsports.svg",
  "nobero": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059122/gocoupon/brands/real_brand_nobero.svg",
  "ezeeperfume": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059125/gocoupon/brands/real_brand_ezeeperfume.svg",
  "ezee-perfume": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059125/gocoupon/brands/real_brand_ezeeperfume.svg",
  "thepantproject": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059127/gocoupon/brands/real_brand_thepantproject.svg",
  "the-pant-project": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059127/gocoupon/brands/real_brand_thepantproject.svg",
  "aceblend": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059129/gocoupon/brands/real_brand_aceblend.svg",
  "ace-blend": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059129/gocoupon/brands/real_brand_aceblend.svg",
  "decodeage": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059132/gocoupon/brands/real_brand_decodeage.png",
  "decode-age": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059132/gocoupon/brands/real_brand_decodeage.png",
  "saadaa": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059133/gocoupon/brands/real_brand_saadaa.png",
  "qatarairways": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059134/gocoupon/brands/real_brand_qatarairways.svg",
  "airindia": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059136/gocoupon/brands/real_brand_airindia.svg",
  "vijaysales": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059146/gocoupon/brands/real_brand_vijaysales.png",
  "wellbeingnutrition": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745781/gocoupon/brands/brand_wellbeing-nutrition.png",
  "banggood": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745883/gocoupon/brands/brand_banggood.png",
  "stylevana": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058497/gocoupon/brands/brand_stylevana.png",
  "oppoindia": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745789/gocoupon/brands/brand_oppo.png",
  "oppo": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745789/gocoupon/brands/brand_oppo.png",
  "tripcom": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745789/gocoupon/brands/brand_trip-com.png",
  "bellavita": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059148/gocoupon/brands/real_brand_bellavita.png",
  "themancompany": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059149/gocoupon/brands/real_brand_themancompany.png",
  "khadinatural": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745794/gocoupon/brands/brand_khadi-natural.png",
  "campusshoes": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745794/gocoupon/brands/brand_campus-shoes.png",
  "decathlon": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059144/gocoupon/brands/real_brand_decathlon.svg",
  "godrejinterio": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745797/gocoupon/brands/brand_godrej-interio.png",
  "dotkey": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745798/gocoupon/brands/brand_dot-key.png",
  "dotandkey": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745798/gocoupon/brands/brand_dot-key.png",
  "redbus": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059147/gocoupon/brands/real_brand_redbus.jpg",
  "wildstone": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745887/gocoupon/brands/brand_wild-stone.png",
  "malaysiaairlines": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745853/gocoupon/brands/brand_malaysia-airlines.png",
  "lotpolishairlines": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745891/gocoupon/brands/brand_lot-polish-airlines.png",
  "lotairlines": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745891/gocoupon/brands/brand_lot-polish-airlines.png",
  "samsung": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059138/gocoupon/brands/real_brand_samsung.svg",
  "delltechnologies": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059139/gocoupon/brands/real_brand_dell.svg",
  "dell": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059139/gocoupon/brands/real_brand_dell.svg",
  "lenovo": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791059141/gocoupon/brands/real_brand_lenovo.svg",
  "ajmalperfumes": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058507/gocoupon/brands/brand_ajmalperfumes.svg",
  "nashermiles": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058509/gocoupon/brands/brand_nashermiles.png",
  "hostinger": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060832/gocoupon/brands/real_brand_hostinger.svg",
  "capresebags": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745844/gocoupon/brands/brand_caprese-bags.png",
  "caprese": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745844/gocoupon/brands/brand_caprese-bags.png",
  "innisfree": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060834/gocoupon/brands/real_brand_innisfree.svg",
  "shein": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060836/gocoupon/brands/real_brand_shein.svg",
  "jcpenney": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058514/gocoupon/brands/brand_jcpenney.png",
  "barcelohotels": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060858/gocoupon/brands/real_brand_barcelo.svg",
  "barcelo": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060858/gocoupon/brands/real_brand_barcelo.svg",
  "adcreativeai": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745885/gocoupon/brands/brand_adcreative-ai.png",
  "adcreative": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745885/gocoupon/brands/brand_adcreative-ai.png",
  "browseai": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745890/gocoupon/brands/brand_browse-ai.png",
  "hamaramall": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745769/gocoupon/brands/brand_hamara-mall.png"
};
export const LOCAL_STORE_LOGOS: Record<string, string> = CLOUDINARY_STORE_LOGOS;

/**
 * Extracts the exact destination merchant root domain from a partner tracking URL.
 */
export function extractMerchantDomain(
  trackingUrl?: string,
  storeName?: string,
  explicitDomain?: string
): string {
  if (explicitDomain && explicitDomain.includes(".") && !explicitDomain.includes("cuelinks") && !explicitDomain.includes("linksredirect")) {
    return explicitDomain.toLowerCase().replace(/^www\./, "").replace(/^m\./, "").replace(/^shop\./, "").trim();
  }

  if (trackingUrl) {
    try {
      const parsed = new URL(trackingUrl);
      const targetUrl = parsed.searchParams.get("url");
      if (targetUrl) {
        const decoded = decodeURIComponent(targetUrl);
        const u = new URL(decoded);
        let host = u.hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "").replace(/^shop\./, "");
        if (host && host.includes(".")) {
          return host;
        }
      }
    } catch {}
  }

  const clean = (storeName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean ? `${clean}.com` : "gocoupon.io";
}

/**
 * Resolves a store logo URL.
 * If an explicit logo URL (e.g., Cloudinary link) is provided, it is returned.
 * If no logo is provided, returns empty string so the UI renders an ultra-fast CSS monogram.
 * External CDN / Google S2 favicon calls are intentionally disabled to maximize loading performance.
 */
export function resolveStoreLogo(
  storeName: string,
  trackingUrl?: string,
  explicitDomain?: string,
  existingLogo?: string
): string {
  // Check Cloudinary store logos static lookup
  const clean = (storeName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (CLOUDINARY_STORE_LOGOS[clean]) {
    return CLOUDINARY_STORE_LOGOS[clean];
  }
  if (CLOUDINARY_STORE_LOGOS[`${clean}-coupons`]) {
    return CLOUDINARY_STORE_LOGOS[`${clean}-coupons`];
  }

  // Check normalized brand name without affiliate/geo/tracking suffixes
  const normalized = (storeName || "")
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/\s+(affiliate|program|cj|apac|int|cz|de|us|uk|ww|india|eu|in|global|store|coupons|tracking|promo codes|many geos).*$/i, "")
    .replace(/[^a-z0-9]/g, "");

  if (normalized && CLOUDINARY_STORE_LOGOS[normalized]) {
    return CLOUDINARY_STORE_LOGOS[normalized];
  }

  // Substring matching against known keys
  for (const [key, url] of Object.entries(CLOUDINARY_STORE_LOGOS)) {
    if (key.length >= 4 && (clean.startsWith(key) || clean.includes(key))) {
      return url;
    }
  }

  // Check if existing logo is an explicitly configured remote URL (e.g. Cloudinary, custom CDN) or local asset
  if (
    existingLogo &&
    typeof existingLogo === "string" &&
    existingLogo.trim() !== "" &&
    !existingLogo.toLowerCase().includes("placeholder")
  ) {
    return existingLogo.trim();
  }

  // Zero-network fallback: return empty string so StoreLogo renders instant CSS initials
  return "";
}

/**
 * Generates 1-2 character initials for store monogram.
 */
export function getStoreInitials(storeName: string): string {
  if (!storeName) return "GC";
  const words = storeName.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  const clean = storeName.replace(/[^a-zA-Z0-9]/g, "");
  return clean.slice(0, 2).toUpperCase() || "ST";
}

const GRADIENT_PALETTES = [
  "from-violet-500 to-indigo-600 text-white",
  "from-rose-500 to-pink-600 text-white",
  "from-amber-500 to-orange-600 text-white",
  "from-emerald-500 to-teal-600 text-white",
  "from-sky-500 to-blue-600 text-white",
  "from-fuchsia-500 to-purple-600 text-white",
  "from-teal-500 to-emerald-600 text-white",
];

/**
 * Returns a deterministic gradient color palette class based on store name.
 */
export function getStoreGradient(storeName: string): string {
  let hash = 0;
  for (let i = 0; i < (storeName || "").length; i++) {
    hash = (hash << 5) - hash + storeName.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index];
}
