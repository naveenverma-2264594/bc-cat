import ThemeRegistry from '../../../../components/mui-table/ThemeRegistry';
import StickyHeadTable from '../../../../components/mui-table/mui-table';

export default function MyTablePage() {
  return (
    <div>
      {/* <h1>My Table</h1> */}
      <h1 className="mb-10 font-[family-name:var(--account-settings-section-font-family,var(--font-family-heading))] text-2xl font-medium leading-none text-[var(--account-settings-section-text,var(--foreground))] @xl:text-2xl">
              My Table
            </h1>
      <ThemeRegistry>
        <StickyHeadTable />
      </ThemeRegistry>
    </div>
  );
}