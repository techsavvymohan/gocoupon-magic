import React from "react";

declare module "@/admin/components/AdminThemeProvider" {
  export const AdminThemeProvider: React.FC<any>;
  export default AdminThemeProvider;
}

declare module "@/admin/components/AdminSidebar" {
  const AdminSidebar: React.FC<any>;
  export default AdminSidebar;
}

declare module "@/admin/components/AdminTopbar" {
  const AdminTopbar: React.FC<any>;
  export default AdminTopbar;
}

declare module "@/admin/components/AdminOffersManager" {
  const AdminOffersManager: React.FC<any>;
  export default AdminOffersManager;
}

declare module "@/admin/components/AdminStoresManager" {
  const AdminStoresManager: React.FC<any>;
  export default AdminStoresManager;
}

declare module "@/admin/components/AdminCategoriesManager" {
  const AdminCategoriesManager: React.FC<any>;
  export default AdminCategoriesManager;
}

declare module "@/admin/components/AdminProductsManager" {
  const AdminProductsManager: React.FC<any>;
  export default AdminProductsManager;
}

declare module "@/admin/components/AdminBlogsManager" {
  const AdminBlogsManager: React.FC<any>;
  export default AdminBlogsManager;
}

declare module "@/admin/components/AdminEventsManager" {
  const AdminEventsManager: React.FC<any>;
  export default AdminEventsManager;
}

declare module "@/admin/components/AdminHeroManager" {
  const AdminHeroManager: React.FC<any>;
  export default AdminHeroManager;
}

declare module "@/admin/components/AdminHomepageSectionsManager" {
  const AdminHomepageSectionsManager: React.FC<any>;
  export default AdminHomepageSectionsManager;
}

declare module "@/admin/components/AdminUsersManager" {
  const AdminUsersManager: React.FC<any>;
  export default AdminUsersManager;
}

declare module "@/admin/components/AdminSettingsPanel" {
  const AdminSettingsPanel: React.FC<any>;
  export default AdminSettingsPanel;
}

declare module "@/admin/components/AdminActivityChart" {
  const AdminActivityChart: React.FC<any>;
  export default AdminActivityChart;
}

declare module "@/admin/components/RecentActivityTable" {
  const RecentActivityTable: React.FC<any>;
  export default RecentActivityTable;
}

declare module "@/admin/components/*" {
  const component: any;
  export default component;
}
