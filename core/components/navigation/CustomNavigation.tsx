
'use client';
import { SubmissionResult, useForm } from '@conform-to/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Popover from '@radix-ui/react-popover';
import { clsx } from 'clsx';
import debounce from 'lodash.debounce';
import { ArrowRight, ChevronDown, MapPin, SearchIcon, ShoppingBag, User } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import React, {
  forwardRef,
  Ref,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { useFormStatus } from 'react-dom';
import { FormStatus } from '@/vibes/soul/form/form-status';
import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Button } from '@/vibes/soul/primitives/button';
import { Logo } from '@/vibes/soul/primitives/logo';
import { Price } from '@/vibes/soul/primitives/price-label';
import { ProductCard } from '@/vibes/soul/primitives/product-card';
import { Link } from '~/components/link';
import { usePathname, useRouter } from '~/i18n/routing';
import { useSearch } from '~/lib/search';
interface Link {
  label: string;
  href: string;
  groups?: Array<{
    label?: string;
    href?: string;
    links: Array<{
      label: string;
      href: string;
    }>;
  }>;
}
interface Locale {
  id: string;
  label: string;
}
interface Currency {
  id: string;
  label: string;
}
type Action<State, Payload> = (
  state: Awaited<State>,
  payload: Awaited<Payload>,
) => State | Promise<State>;
export type SearchResult =
  | {
      type: 'products';
      title: string;
      products: Array<{
        id: string;
        title: string;
        href: string;
        price?: Price;
        image?: { src: string; alt: string };
      }>;
    }
  | {
      type: 'links';
      title: string;
      links: Array<{ label: string; href: string }>;
    };
type CurrencyAction = Action<SubmissionResult | null, FormData>;
type SearchAction<S extends SearchResult> = Action<
  {
    searchResults: S[] | null;
    lastResult: SubmissionResult | null;
    emptyStateTitle?: string;
    emptyStateSubtitle?: string;
  },
  FormData
>;
interface Props<S extends SearchResult> {
  className?: string;
  isFloating?: boolean;
  accountHref: string;
  cartCount?: Streamable<number | null>;
  cartHref: string;
  links: Streamable<Link[]>;
  linksPosition?: 'center' | 'left' | 'right';
  locales?: Locale[];
  activeLocaleId?: string;
  currencies?: Currency[];
  activeCurrencyId?: Streamable<string | undefined>;
  currencyAction?: CurrencyAction;
  logo?: Streamable<string | { src: string; alt: string } | null>;
  logoWidth?: number;
  logoHeight?: number;
  logoHref?: string;
  logoLabel?: string;
  mobileLogo?: Streamable<string | { src: string; alt: string } | null>;
  mobileLogoWidth?: number;
  mobileLogoHeight?: number;
  searchHref: string;
  searchParamName?: string;
  searchAction?: SearchAction<S>;
  searchInputPlaceholder?: string;
  searchSubmitLabel?: string;
  cartLabel?: string;
  accountLabel?: string;
  locationLabel?: string;
  locationHref?: string;
  openSearchPopupLabel?: string;
  searchLabel?: string;
  mobileMenuTriggerLabel?: string;
  switchCurrencyLabel?: string;
  username?: string; // Add username prop
}
const MobileMenuButton = forwardRef<
  React.ComponentRef<'button'>,
  { open: boolean } & React.ComponentPropsWithoutRef<'button'>
>(({ open, className, ...rest }, ref) => {
  return (
    <button
      {...rest}
      className={clsx(
        'group relative rounded-lg p-2 outline-0 ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors focus-visible:ring-2',
        className,
      )}
      ref={ref}
    >
      <div className="flex h-4 w-4 origin-center transform flex-col justify-between overflow-hidden transition-all duration-300">
        <div
          className={clsx(
            'h-px origin-left transform bg-[var(--nav-mobile-button-icon,hsl(var(--foreground)))] transition-all duration-300',
            open ? 'translate-x-10' : 'w-7',
          )}
        />
        <div
          className={clsx(
            'h-px transform rounded bg-[var(--nav-mobile-button-icon,hsl(var(--foreground)))] transition-all delay-75 duration-300',
            open ? 'translate-x-10' : 'w-7',
          )}
        />
        <div
          className={clsx(
            'h-px origin-left transform bg-[var(--nav-mobile-button-icon,hsl(var(--foreground)))] transition-all delay-150 duration-300',
            open ? 'translate-x-10' : 'w-7',
          )}
        />
        <div
          className={clsx(
            'absolute top-2 flex transform items-center justify-between bg-[var(--nav-mobile-button-icon,hsl(var(--foreground)))] transition-all duration-500',
            open ? 'w-12 translate-x-0' : 'w-0 -translate-x-10',
          )}
        >
          <div
            className={clsx(
              'absolute h-px w-4 transform bg-[var(--nav-mobile-button-icon,hsl(var(--foreground)))] transition-all delay-300 duration-500',
              open ? 'rotate-45' : 'rotate-0',
            )}
          />
          <div
            className={clsx(
              'absolute h-px w-4 transform bg-[var(--nav-mobile-button-icon,hsl(var(--foreground)))] transition-all delay-300 duration-500',
              open ? '-rotate-45' : 'rotate-0',
            )}
          />
        </div>
      </div>
    </button>
  );
});
MobileMenuButton.displayName = 'MobileMenuButton';
const navGroupClassName =
  'block rounded-lg bg-[var(--nav-group-background,transparent)] px-3 py-2 font-[family-name:var(--nav-group-font-family,var(--font-family-body))] font-medium text-[var(--nav-group-text,hsl(var(--foreground)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-group-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-group-text-hover,hsl(var(--foreground)))] focus-visible:outline-0 focus-visible:ring-2';
const navButtonClassName =
  'relative rounded-lg bg-[var(--nav-button-background,transparent)] p-1.5 text-[var(--nav-button-icon,hsl(var(--foreground)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors focus-visible:outline-0 focus-visible:ring-2 @4xl:hover:bg-[var(--nav-button-background-hover,hsl(var(--contrast-100)))] @4xl:hover:text-[var(--nav-button-icon-hover,hsl(var(--foreground)))]';
// Assign NavigationMenu components to variables for JSX compatibility
const NavigationMenuRoot = NavigationMenu.Root;
const NavigationMenuItem = NavigationMenu.Item;
const NavigationMenuTrigger = NavigationMenu.Trigger;
const NavigationMenuContent = NavigationMenu.Content;
const NavigationMenuViewport = NavigationMenu.Viewport;
export const Navigation = forwardRef(function Navigation<S extends SearchResult>(
  {
    className,
    isFloating = false,
    cartHref,
    cartCount: streamableCartCount,
    accountHref,
    links: streamableLinks,
    logo: streamableLogo,
    logoHref = '/',
    logoLabel = 'Home',
    logoWidth = 200,
    logoHeight = 40,
    mobileLogo: streamableMobileLogo,
    mobileLogoWidth = 100,
    mobileLogoHeight = 40,
    linksPosition = 'center',
    activeLocaleId,
    locales,
    currencies: streamableCurrencies,
    activeCurrencyId: streamableActiveCurrencyId,
    currencyAction,
    searchHref,
    searchParamName = 'query',
    searchAction,
    searchInputPlaceholder,
    searchSubmitLabel,
    cartLabel = 'Cart',
    accountLabel = 'Profile',
    locationLabel = 'Location',
    locationHref = '/location',
    openSearchPopupLabel = 'Open search popup',
    searchLabel = 'Search',
    mobileMenuTriggerLabel = 'Toggle navigation',
    switchCurrencyLabel,
    username, // Add username prop
  }: Props<S>,
  ref: Ref<HTMLDivElement>,
) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSearchOpen, setIsSearchOpen } = useSearch();
  const pathname = usePathname();
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname, setIsSearchOpen]);
  useEffect(() => {
    function handleScroll() {
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setIsSearchOpen]);
  return (
    <NavigationMenuRoot
      className={clsx('relative mx-auto w-full max-w-screen-2xl @container', className)}
      delayDuration={0}
      onValueChange={() => setIsSearchOpen(false)}
      ref={ref}
    >
      {/* Use a vertical layout so we can place the search in a top row and the links on a second row */}
      <div
        className={clsx(
          'flex flex-col bg-[var(--nav-background,hsl(var(--background)))] transition-shadow @4xl:rounded-t-2xl @4xl:px-2 @4xl:pl-6 @4xl:pr-2.5',
          isFloating
            ? 'shadow-xl ring-1 ring-[var(--nav-floating-border,hsl(var(--foreground)/10%))]'
            : 'shadow-none ring-0',
        )}
      >
        {/* Top row: mobile menu, logo, icons (no search bar for mobile/tablet) */}
        <div className="flex items-center justify-between gap-1 py-2 pl-3 pr-2">
          {/* Mobile Menu */}
          <Popover.Root onOpenChange={setIsMobileMenuOpen} open={isMobileMenuOpen}>
            <Popover.Anchor className="absolute left-0 right-0 top-full" />
            <Popover.Trigger asChild>
              <MobileMenuButton
                aria-label={mobileMenuTriggerLabel}
                className="mr-1 @4xl:hidden"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                open={isMobileMenuOpen}
              />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className="max-h-[calc(var(--radix-popover-content-available-height)-8px)] w-[var(--radix-popper-anchor-width)] @container data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                <div className="max-h-[inherit] divide-y divide-[var(--nav-mobile-divider,hsl(var(--contrast-100)))] overflow-y-auto bg-[var(--nav-mobile-background,hsl(var(--background)))]">
                  {/* Username at top of burger menu */}
                  {username && (
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--nav-mobile-divider,hsl(var(--contrast-100)))] @4xl:hidden">
                      <User size={20} strokeWidth={1.5} className="text-[var(--nav-mobile-link-text,hsl(var(--foreground)))]" />
                      <span className="font-semibold text-[var(--nav-mobile-link-text,hsl(var(--foreground)))]">{username}</span>
                    </div>
                  )}
                  <Stream
                    fallback={
                      <ul className="flex animate-pulse flex-col gap-4 p-5 @4xl:gap-2 @4xl:p-5">
                        <li>
                          <span className="block h-4 w-10 rounded-md bg-contrast-100" />
                        </li>
                        <li>
                          <span className="block h-4 w-14 rounded-md bg-contrast-100" />
                        </li>
                        <li>
                          <span className="block h-4 w-24 rounded-md bg-contrast-100" />
                        </li>
                        <li>
                          <span className="block h-4 w-16 rounded-md bg-contrast-100" />
                        </li>
                      </ul>
                    }
                    value={streamableLinks}
                  >
                    {(links) =>
                      links.map((item, i) => (
                        <ul className="flex flex-col p-2 @4xl:gap-2 @4xl:p-5" key={i}>
                          {item.label !== '' && (
                            <li>
                              <Link
                                className="block rounded-lg bg-[var(--nav-mobile-link-background,transparent)] px-3 py-2 font-[family-name:var(--nav-mobile-link-font-family,var,--font-family-body))] font-semibold text-[var(--nav-mobile-link-text,hsl(var(--foreground)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-mobile-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-mobile-link-text-hover,hsl(var(--foreground)))] focus-visible:outline-0 focus-visible:ring-2 @4xl:py-4"
                                href={item.href}
                              >
                                {item.label}
                              </Link>
                            </li>
                          )}
                          {item.groups
                            ?.flatMap((group) => group.links)
                            .map((link, j) => (
                              <li key={j}>
                                <Link
                                  className="block rounded-lg bg-[var(--nav-mobile-sub-link-background,transparent)] px-3 py-2 font-[family-name:var(--nav-mobile-sub-link-font-family,var,--font-family-body))] text-sm font-medium text-[var(--nav-mobile-sub-link-text,hsl(var(--contrast-500)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-mobile-sub-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-mobile-sub-link-text-hover,hsl(var(--foreground)))] focus-visible:outline-0 focus-visible:ring-2 @4xl:py-4"
                                  href={link.href}
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                        </ul>
                      ))
                    }
                  </Stream>
                  {/* Mobile Locale / Currency Dropdown */}
                  {locales && locales.length > 1 && streamableCurrencies && (
                    <div className="p-2 @4xl:p-5">
                      <div className="flex items-center px-3 py-1 @4xl:py-2">
                        {/* Locale / Language Dropdown */}
                        {locales.length > 1 ? (
                          <LocaleSwitcher
                            activeLocaleId={activeLocaleId}
                            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                            locales={locales as [Locale, Locale, ...Locale[]]}
                          />
                        ) : null}
                        {/* Currency Dropdown */}
                        <Stream
                          fallback={null}
                          value={Streamable.all([streamableCurrencies, streamableActiveCurrencyId])}
                        >
                          {([currencies, activeCurrencyId]) =>
                            currencies.length > 1 && currencyAction ? (
                              <CurrencyForm
                                action={currencyAction}
                                activeCurrencyId={activeCurrencyId}
                                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                                currencies={currencies as [Currency, ...Currency[]]}
                              />
                            ) : null
                          }
                        </Stream>
                      </div>
                    </div>
                  )}
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          {/* Logo */}
          <div className={clsx('flex items-center justify-start self-stretch @4xl:flex-none')}>
            <Logo
              className={clsx(streamableMobileLogo != null ? 'hidden @4xl:flex' : 'flex')}
              height={logoHeight}
              href={logoHref}
              label={logoLabel}
              logo={streamableLogo}
              width={logoWidth}
            />
            {streamableMobileLogo != null && (
              <Logo
                className="flex @4xl:hidden"
                height={mobileLogoHeight}
                href={logoHref}
                label={logoLabel}
                logo={streamableMobileLogo}
                width={mobileLogoWidth}
              />
            )}
          </div>
          {/* Search bar: only show inline for desktop */}
          <div className="hidden @4xl:flex flex-1 justify-center px-2">
            <div className="w-full max-w-full sm:max-w-[820px] box-border">
              {searchAction ? (
                <SearchForm
                  searchAction={searchAction}
                  searchHref={searchHref}
                  searchInputPlaceholder={searchInputPlaceholder}
                  searchParamName={searchParamName}
                  searchSubmitLabel={searchSubmitLabel}
                />
              ) : null}
            </div>
          </div>
          {/* Icon Buttons (right side of top row) */}
          <div className={clsx('flex items-center justify-end gap-0.5 transition-colors duration-300 @4xl:flex-none')}>
            {/* Search icon removed for all views */}
            <Link aria-label={locationLabel} className={navButtonClassName} href={locationHref}>
              <MapPin size={20} strokeWidth={1} />
            </Link>
            <Link aria-label={accountLabel} className={clsx(navButtonClassName, '@4xl:inline-flex @4xl:visible hidden invisible')} href={accountHref}>
              <User size={20} strokeWidth={1} />
            </Link>
            <Link aria-label={cartLabel} className={navButtonClassName} href={cartHref}>
              <ShoppingBag size={20} strokeWidth={1} />
              <Stream
                fallback={
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-contrast-100 text-xs text-background" />
                }
                value={streamableCartCount}
              >
                {(cartCount) =>
                  cartCount != null &&
                  cartCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--nav-cart-count-background,hsl(var(--foreground)))] font-[family-name:var(--nav-cart-count-font-family,var,--font-family-body))] text-xs text-[var(--nav-cart-count-text,hsl(var(--background)))]">
                      {cartCount}
                    </span>
                  )
                }
              </Stream>
            </Link>
            {/* Locale / Language Dropdown */}
            {locales && locales.length > 1 ? (
              <LocaleSwitcher
                activeLocaleId={activeLocaleId}
                className="hidden @4xl:block"
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                locales={locales as [Locale, Locale, ...Locale[]]}
              />
            ) : null}
            {/* Currency Dropdown */}
            <Stream
              fallback={null}
              value={Streamable.all([streamableCurrencies, streamableActiveCurrencyId])}
            >
              {([currencies, activeCurrencyId]) =>
                currencies && currencies.length > 1 && currencyAction ? (
                  <CurrencyForm
                    action={currencyAction}
                    activeCurrencyId={activeCurrencyId}
                    className="hidden @4xl:block"
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    currencies={currencies as [Currency, ...Currency[]]}
                    switchCurrencyLabel={switchCurrencyLabel}
                  />
                ) : null
              }
            </Stream>
          </div>
        </div>
        {/* Search bar row for tablet/phone: below logo/icons, full width, centered */}
        <div className="flex @4xl:hidden w-full justify-center px-4 pb-2">
          <div className="w-full max-w-[600px]">
            {searchAction ? (
              <SearchForm
                searchAction={searchAction}
                searchHref={searchHref}
                searchInputPlaceholder={searchInputPlaceholder}
                searchParamName={searchParamName}
                searchSubmitLabel={searchSubmitLabel}
              />
            ) : null}
          </div>
        </div>
      </div>
      {/* second row: top level nav links (desktop) */}
      <div className={clsx(
        "hidden @4xl:flex w-full bg-[var(--nav-background,hsl(var(--background)))] @4xl:rounded-b-2xl @4xl:px-2",
        isFloating
          ? "shadow-xl ring-1 ring-[var(--nav-floating-border,hsl(var(--foreground)/10%))]"
          : "shadow-none ring-0"
      )}>
        <ul
          className={clsx(
            'mx-auto flex gap-10 w-full max-w-screen-2xl @4xl:flex-1',
            {
              left: 'justify-start',
              center: 'justify-center',
              right: 'justify-end',
            }[linksPosition],
          )}
        >
          <Stream
            fallback={
              <ul className="flex min-h-[41px] animate-pulse flex-row items-center @4xl:gap-6 @4xl:p-2.5">
                <li>
                  <span className="block h-4 w-10 rounded-md bg-contrast-100" />
                </li>
                <li>
                  <span className="block h-4 w-14 rounded-md bg-contrast-100" />
                </li>
                <li>
                  <span className="block h-4 w-24 rounded-md bg-contrast-100" />
                </li>
                <li>
                  <span className="block h-4 w-16 rounded-md bg-contrast-100" />
                </li>
              </ul>
            }
            value={streamableLinks}
          >
            {(links) => {
              // Split categories: first 8 main, rest as children of "More"
              const mainCategories = links.slice(0, 8);
              const moreCategories = links.slice(8);
              const navLinks = [...mainCategories];
              if (moreCategories.length > 0) {
                navLinks.push({
                  label: 'More',
                  href: '#',
                  groups: [
                    {
                      label: '',
                      links: moreCategories.map(({ label, href }) => ({
                        label,
                        href,
                      })),
                    },
                  ],
                });
              }
              return navLinks.map((item, i) => (
                <NavigationMenuItem key={i} value={i.toString()}>
                  <NavigationMenuTrigger asChild>
                    <Link
                      className="hidden items-center whitespace-nowrap rounded-xl bg-[var(--nav-link-background,transparent)] p-2.5 font-[family-name:var(--nav-link-font-family,var(--font-family-body))] text-sm font-medium text-[var(--nav-link-text,hsl(var(--foreground)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors duration-200 hover:bg-[var(--nav-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-link-text-hover,hsl(var(--foreground)))] focus-visible:outline-0 focus-visible:ring-2 @4xl:inline-flex"
                      href={item.href}
                    >
                      {item.label}
                      {/* Show chevron for More tab only */}
                      {item.label === 'More' && (
                        <ChevronDown size={16} strokeWidth={1.5} className="ml-1" />
                      )}
                    </Link>
                  </NavigationMenuTrigger>
                  {item.label === 'More' && item.groups != null && item.groups.length > 0 && (
                    // Use w-full instead of w-[100vw] to prevent horizontal overflow and unwanted scrollbar
                    <NavigationMenuContent className="fixed left-0 right-0 top-full w-full bg-[var(--nav-menu-background,hsl(var(--background)))] shadow-xl ring-1 ring-[var(--nav-menu-border,hsl(var(--foreground)/5%))] rounded-b-2xl rounded-t-none z-50">
                      <div className="w-full max-w-screen-2xl pl-3 grid grid-cols-6 gap-12 px-12 pb-12 pt-8">
                        {/* Render each extra category as its own column */}
                        {item.groups[0]?.links?.map((link, idx) => (
                          <ul className="flex flex-col px-6" key={idx}>
                            {/* Category label as column header */}
                            <li>
                              <Link
                                className={navGroupClassName}
                                href={link.href}
                              >
                                {link.label}
                              </Link>
                            </li>
                            {/* Render child categories if present */}
                            {links
                              .find((cat) => cat.label === link.label)?.groups?.map((childGroup, childIdx) => (
                                <React.Fragment key={childIdx}>
                                  {childGroup.label && (
                                    <li>
                                      {childGroup.href ? (
                                        <Link className={navGroupClassName} href={childGroup.href}>
                                          {childGroup.label}
                                        </Link>
                                      ) : (
                                        <span className={navGroupClassName}>{childGroup.label}</span>
                                      )}
                                    </li>
                                  )}
                                  {childGroup.links && childGroup.links.map((childLink, subIdx) => (
                                    <li key={subIdx}>
                                      <Link
                                        className="block rounded-lg bg-[var(--nav-sub-link-background,transparent)] px-3 py-1.5 font-[family-name:var(--nav-sub-link-font-family,var,--font-family-body))] text-sm font-medium text-[var(--nav-sub-link-text,hsl(var(--contrast-500)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-sub-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-sub-link-text-hover,hsl(var,--foreground)))] focus-visible:outline-0 focus-visible:ring-2"
                                        href={childLink.href}
                                      >
                                        {childLink.label}
                                      </Link>
                                    </li>
                                  ))}
                                </React.Fragment>
                              ))}
                          </ul>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  )}
                  {/* ...existing code for normal categories... */}
                  {item.label !== 'More' && item.groups != null && item.groups.length > 0 && (
                    <NavigationMenuContent className="fixed left-0 right-0 top-full w-[100vw] bg-[var(--nav-menu-background,hsl(var(--background)))] shadow-xl ring-1 ring-[var(--nav-menu-border,hsl(var(--foreground)/5%))] rounded-b-2xl rounded-t-none z-50">
                      <div className="m-auto grid w-full max-w-screen-lg grid-cols-5 justify-center gap-5 px-5 pb-8 pt-5">
                        {item.groups.map((group, columnIndex) => (
                          <ul className="flex flex-col" key={columnIndex}>
                            {group.label != null && group.label !== '' && (
                              <li>
                                {group.href != null && group.href !== '' ? (
                                  <Link className={navGroupClassName} href={group.href}>
                                    {group.label}
                                  </Link>
                                ) : (
                                  <span className={navGroupClassName}>{group.label}</span>
                                )}
                              </li>
                            )}
                            {group.links && group.links.map((groupLink, groupIdx) => (
                              <li key={groupIdx}>
                                <Link
                                  className="block rounded-lg bg-[var(--nav-sub-link-background,transparent)] px-3 py-1.5 font-[family-name:var(--nav-sub-link-font-family,var,--font-family-body))] text-sm font-medium text-[var(--nav-sub-link-text,hsl(var(--contrast-500)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-sub-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-sub-link-text-hover,hsl(var,--foreground)))] focus-visible:outline-0 focus-visible:ring-2"
                                  href={groupLink.href}
                                >
                                  {groupLink.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  )}
                </NavigationMenuItem>
              ));
            }}
          </Stream>
        </ul>
      </div>
      <div className="perspective-[2000px] absolute left-0 right-0 top-full z-50 flex w-full justify-center">
        <NavigationMenuViewport className="relative mt-2 w-full data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95" />
      </div>
    </NavigationMenuRoot>
  );
});
Navigation.displayName = 'Navigation';
// Provide a named alias so other components can import the custom navigation
// using the same `CustomNavigation` symbol used elsewhere in the codebase.
export const CustomNavigation = Navigation;
function SearchForm<S extends SearchResult>({
  searchAction,
  searchParamName = 'query',
  searchHref = '/search',
  searchInputPlaceholder = 'Search by product name, ID, SKU or description...',
  searchSubmitLabel = 'Submit',
}: {
  searchAction: SearchAction<S>;
  searchParamName?: string;
  searchHref?: string;
  searchInputPlaceholder?: string;
  searchSubmitLabel?: string;
}) {
  const [query, setQuery] = useState('');
  const [isSearching, startSearching] = useTransition();
  const [{ searchResults, lastResult, emptyStateTitle, emptyStateSubtitle }, formAction] =
    useActionState(searchAction, {
      searchResults: null,
      lastResult: null,
    });
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPending = isSearching || isDebouncing || isSubmitting;
  const debouncedOnChange = useMemo(() => {
    const debounced = debounce((q: string) => {
      setIsDebouncing(false);
      const formData = new FormData();
      formData.append(searchParamName, q);
      startSearching(() => {
        formAction(formData);
      });
    }, 300);
    return (q: string) => {
      setIsDebouncing(true);
      debounced(q);
    };
  }, [formAction, searchParamName]);
  const [form] = useForm({ lastResult });
  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);
  }, []);
  return (
    <>
      <form
        action={searchHref}
        className="flex items-center gap-2 h-[48px] w-full max-w-full lg:max-w-[820px] px-4 rounded-[4px] border border-[#CED0D1] border-contrast-200 box-border mx-auto items-center"
        onSubmit={handleSubmit}
      >
        <SearchIcon
          className="shrink-0 text-black flex h-6 w-6"
          size={24}
          width={24}
          height={24}
          strokeWidth={1}
        />
        <input
          className="grow bg-transparent pl-3 text-lg font-medium outline-0 focus-visible:outline-none leading-none h-6 placeholder:text-[14px] placeholder:font-[400] placeholder:text-[#A3A9AC] placeholder:contrast-300"
          name={searchParamName}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            debouncedOnChange(e.currentTarget.value);
          }}
          placeholder={searchInputPlaceholder}
          type="text"
          value={query}
        />
        {query.trim() !== '' ? (
          <SubmitButton
            loading={isPending}
            submitLabel={searchSubmitLabel}
            className="w-[20px] h-[20px] p-0"
          />
        ) : null}
      </form>
      <SearchResults
        emptySearchSubtitle={emptyStateSubtitle}
        emptySearchTitle={emptyStateTitle}
        errors={form.errors}
        query={query}
        searchParamName={searchParamName}
        searchResults={searchResults}
        stale={isPending}
      />
    </>
  );
}
function SubmitButton({
  loading,
  submitLabel,
  className,
}: {
  loading: boolean;
  submitLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      className={className}
      loading={pending || loading}
      shape="circle"
      size="medium"
      type="submit"
      variant="secondary"
    >
      <ArrowRight aria-label={submitLabel} size={20} strokeWidth={1.5} />
    </Button>
  );
}
function SearchResults({
  query,
  searchResults,
  stale,
  emptySearchTitle = `No results were found for '${query}'`,
  emptySearchSubtitle = 'Please try another search.',
  errors,
}: {
  query: string;
  searchParamName: string;
  emptySearchTitle?: string;
  emptySearchSubtitle?: string;
  searchResults: SearchResult[] | null;
  stale: boolean;
  errors?: string[];
}) {
  if (query === '') return null;
  if (errors != null && errors.length > 0) {
    if (stale) return null;
    return (
      <div className="flex flex-col border-t border-[var(--nav-search-divider,hsl(var(--contrast-100)))] p-6">
        {errors.map((error) => (
          <FormStatus key={error} type="error">
            {error}
          </FormStatus>
        ))}
      </div>
    );
  }
  if (searchResults == null || searchResults.length === 0) {
    if (stale) return null;
    return (
      <div className="flex flex-col border-t border-[var(--nav-search-divider,hsl(var(--contrast-100)))] p-6">
        <p className="text-2xl font-medium text-[var(--nav-search-empty-title,hsl(var(--foreground)))]">
          {emptySearchTitle}
        </p>
        <p className="text-[var(--nav-search-empty-subtitle,hsl(var(--contrast-500)))]">
          {emptySearchSubtitle}
        </p>
      </div>
    );
  }
  return (
    <div
      className={clsx(
        'flex flex-1 flex-col overflow-y-auto border-t border-[var(--nav-search-divider,hsl(var(--contrast-100)))] @2xl:flex-row',
        stale && 'opacity-50',
      )}
    >
      {searchResults.map((result, index) => {
        switch (result.type) {
          case 'links': {
            return (
              <section
                aria-label={result.title}
                className="flex w-full flex-col gap-1 border-b border-[var(--nav-search-divider,hsl(var(--contrast-100)))] p-5 @2xl:max-w-80 @2xl:border-b-0 @2xl:border-r"
                key={`result-${index}`}
              >
                <h3 className="mb-4 font-[family-name:var(--nav-search-result-title-font-family,var,--font-family-mono))] text-sm uppercase text-[var(--nav-search-result-title,hsl(var(--foreground)))]">
                  {result.title}
                </h3>
                <ul role="listbox">
                  {result.links.map((link, i) => (
                    <li key={i}>
                      <Link
                        className="block rounded-lg bg-[var(--nav-search-result-link-background,transparent)] px-3 py-4 font-[family-name:var(--nav-search-result-link-font-family,var(--font-family-body))] font-semibold text-[var(--nav-search-result-link-text,hsl(var(--contrast-500)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-search-result-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-search-result-link-text-hover,hsl(var,--foreground)))] focus-visible:outline-0 focus-visible:ring-2"
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          }
          case 'products': {
            return (
              <section
                aria-label={result.title}
                className="flex w-full flex-col gap-5 p-5"
                key={`result-${index}`}
              >
                <h3 className="font-[family-name:var(--nav-search-result-title-font-family,var,--font-family-mono))] text-sm uppercase text-[var(--nav-search-result-title,hsl(var(--foreground)))]">
                  {result.title}
                </h3>
                <ul
                  className="grid w-full grid-cols-2 gap-5 @xl:grid-cols-4 @2xl:grid-cols-2 @4xl:grid-cols-4"
                  role="listbox"
                >
                  {result.products.map((product) => (
                    <li key={product.id}>
                      <ProductCard
                        imageSizes="(min-width: 42rem) 25vw, 50vw"
                        product={{
                          id: product.id,
                          title: product.title,
                          href: product.href,
                          price: product.price,
                          image: product.image,
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
const useSwitchLocale = () => {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  return useCallback(
    (locale: string) =>
      router.push(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params, query: Object.fromEntries(searchParams.entries()) },
        { locale },
      ),
    [pathname, params, router, searchParams],
  );
};
function LocaleSwitcher({
  locales,
  activeLocaleId,
  className,
}: {
  activeLocaleId?: string;
  locales: [Locale, ...Locale[]];
  className?: string;
}) {
  const activeLocale = locales.find((locale) => locale.id === activeLocaleId);
  const [isPending, startTransition] = useTransition();
  const switchLocale = useSwitchLocale();
  return (
    <div className={className}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          className={clsx(
            'flex items-center gap-1 text-xs uppercase transition-opacity disabled:opacity-30',
            navButtonClassName,
          )}
          disabled={isPending}
        >
          {activeLocale?.id ?? locales[0].id}
          <ChevronDown size={16} strokeWidth={1.5} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            className="z-50 max-h-80 overflow-y-scroll rounded-xl bg-[var(--nav-locale-background,hsl(var(--background)))] p-2 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 @4xl:w-32 @4xl:rounded-2xl @4xl:p-2"
            sideOffset={16}
          >
            {locales.map(({ id, label }) => (
              <DropdownMenu.Item
                className={clsx(
                  'cursor-default rounded-lg bg-[var(--nav-locale-link-background,transparent)] px-2.5 py-2 font-[family-name:var(--nav-locale-link-font-family,var,--font-family-body))] text-sm font-medium text-[var(--nav-locale-link-text,hsl(var(--contrast-400)))] outline-none ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-locale-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-locale-link-text-hover,hsl(var,--foreground)))]',
                  {
                    'text-[var(--nav-locale-link-text-selected,hsl(var(--foreground)))]':
                      id === activeLocaleId,
                  },
                )}
                key={id}
                onSelect={() => startTransition(() => switchLocale(id))}
              >
                {label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
function CurrencyForm({
  action,
  currencies,
  activeCurrencyId,
  switchCurrencyLabel = 'Switch currency',
  className,
}: {
  activeCurrencyId?: string;
  action: CurrencyAction;
  currencies: [Currency, ...Currency[]];
  switchCurrencyLabel?: string;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastResult, formAction] = useActionState(action, null);
  const activeCurrency = currencies.find((currency) => currency.id === activeCurrencyId);
  useEffect(() => {
    // eslint-disable-next-line no-console
    if (lastResult?.error) console.log(lastResult.error);
  }, [lastResult?.error]);
  return (
    <div className={className}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          className={clsx(
            'flex items-center gap-1 text-xs uppercase transition-opacity disabled:opacity-30',
            navButtonClassName,
          )}
          disabled={isPending}
        >
          {activeCurrency?.label ?? currencies[0].label}
          <ChevronDown size={16} strokeWidth={1.5}>
            <title>{switchCurrencyLabel}</title>
          </ChevronDown>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            className="z-50 max-h-80 overflow-y-scroll rounded-xl bg-[var(--nav-locale-background,hsl(var(--background)))] p-2 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 @4xl:w-32 @4xl:rounded-2xl @4xl:p-2"
            sideOffset={16}
          >
            {currencies.map((currency) => (
              <DropdownMenu.Item
                className={clsx(
                  'cursor-default rounded-lg bg-[var(--nav-locale-link-background,transparent)] px-2.5 py-2 font-[family-name:var(--nav-locale-link-font-family,var,--font-family-body))] text-sm font-medium text-[var(--nav-locale-link-text,hsl(var(--contrast-400)))] outline-none ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-locale-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-locale-link-text-hover,hsl(var,--foreground)))]',
                  {
                    'text-[var(--nav-locale-link-text-selected,hsl(var(--foreground)))]':
                      currency.id === activeCurrencyId,
                  },
                )}
                key={currency.id}
                onSelect={() => {
                  // eslint-disable-next-line @typescript-eslint/require-await
                  startTransition(async () => {
                    const formData = new FormData();
                    formData.append('id', currency.id);
                    formAction(formData);
                    // This is needed to refresh the Data Cache after the product has been added to the cart.
                    // The cart id is not picked up after the first time the cart is created/updated.
                    router.refresh();
                  });
                }}
              >
                {currency.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
