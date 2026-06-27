import React, { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import AdminLayout from "./AdminLayout";

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProjects = lazy(() => import("./pages/AdminProjects"));
const AdminMedia = lazy(() => import("./pages/AdminMedia"));
const AdminStore = lazy(() => import("./pages/AdminStore"));
const AdminServices = lazy(() => import("./pages/AdminServices"));
const AdminTestimonials = lazy(() => import("./pages/AdminTestimonials"));
const AdminContactRequests = lazy(() => import("./pages/AdminContactRequests"));
const AdminBookings = lazy(() => import("./pages/AdminBookings"));
const AdminFAQs = lazy(() => import("./pages/AdminFAQs"));
const AdminTeam = lazy(() => import("./pages/AdminTeam"));
const AdminMaterialBrands = lazy(() => import("./pages/AdminMaterialBrands"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));

export default function AdminApp() {
  return (
    <AdminLayout>
      <Suspense fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <Switch>
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/projects" component={AdminProjects} />
          <Route path="/admin/media" component={AdminMedia} />
          <Route path="/admin/store" component={AdminStore} />
          <Route path="/admin/services" component={AdminServices} />
          <Route path="/admin/testimonials" component={AdminTestimonials} />
          <Route path="/admin/contacts" component={AdminContactRequests} />
          <Route path="/admin/bookings" component={AdminBookings} />
          <Route path="/admin/faqs" component={AdminFAQs} />
          <Route path="/admin/team" component={AdminTeam} />
          <Route path="/admin/brands" component={AdminMaterialBrands} />
          <Route path="/admin/settings" component={AdminSettings} />
          <Route path="/admin/users" component={AdminUsers} />
        </Switch>
      </Suspense>
    </AdminLayout>
  );
}
