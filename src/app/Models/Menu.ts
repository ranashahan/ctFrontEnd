export const Menu = {
  menu: [
    {
      path: '/dashboard',
      name: 'Dashboard',
      roles: ['admin', 'manager', 'staff', 'member'],
      icon: 'fa-solid fa-house fa-flip me-1',
    },
  ],
  dropdownMenus: [
    {
      name: 'Drivers',
      icon: 'fa-solid fa-truck-moving fa-bounce me-1',
      id: 'driver',
      roles: ['admin', 'manager', 'staff', 'member'],
      items: [
        {
          name: 'All Drivers',
          path: '/alldrivers',
          roles: ['admin', 'manager', 'staff', 'member'],
          icon: 'fa-solid fa-truck-moving me-1',
        },
        {
          name: 'Add Driver',
          path: '/adddriver',
          roles: ['admin', 'manager', 'staff', 'member'],
          icon: 'fa-solid fa-plus me-1',
        },
        {
          name: 'Drivers Report',
          path: '/driversreport',
          roles: ['admin', 'manager', 'staff'],
          icon: 'fa-solid fa-database me-1',
        },
      ],
    },
    {
      name: 'Assessments',
      icon: 'fa-solid fa-table-cells fa-beat me-1',
      id: 'assessments',
      roles: ['admin', 'manager', 'staff', 'member'],
      items: [
        {
          name: 'All Assessments',
          path: '/allassessments',
          roles: ['admin', 'manager', 'staff', 'member'],
          icon: 'fa-solid fa-table-cells me-1',
        },
        {
          name: 'Add Assessment',
          path: '/addassessment',
          roles: ['admin', 'manager', 'staff', 'member'],
          icon: 'fa-solid fa-table me-1',
        },
        {
          name: 'Add AssessmentEXP ',
          path: '/addassessmentEXP',
          roles: ['admin'],
          icon: 'fa-solid fa-table me-1',
        },
        {
          name: 'Assessments Report',
          path: '/assessmentsreport',
          roles: ['admin', 'manager', 'staff'],
          icon: 'fa-solid fa-database me-1',
        },
        {
          name: 'Assessments Configure',
          path: '/assessmentsconfigure',
          roles: ['admin', 'manager'],
          icon: 'fa-solid fa-wrench me-1',
        },
      ],
    },
    {
      name: 'Training',
      icon: 'fa-solid fa-laptop-code fa-beat-fade me-1',
      id: 'training',
      roles: ['admin', 'manager'],
      items: [
        {
          name: 'All Trainings',
          path: '/alltrainings',
          roles: ['admin', 'manager'],
          icon: 'fa-solid fa-book-open-reader me-1',
        },
        {
          name: 'Add Training',
          path: '/addtraining',
          roles: ['admin', 'manager'],
          icon: 'fa-solid fa-network-wired me-1',
        },
        {
          name: 'Training Report',
          path: '/trainingsreport',
          roles: ['admin', 'manager'],
          icon: 'fa-solid fa-laptop-file me-1',
        },
      ],
    },
    {
      name: 'Settings',
      icon: 'fa-solid fa-cog fa-spin me-1',
      id: 'settings',
      roles: ['admin', 'manager'],
      items: [
        {
          name: 'Trainers',
          path: '/trainer',
          roles: ['admin', 'manager'],
          icon: 'fa-solid fa-person-chalkboard me-1',
        },
        {
          name: 'BloodGroups',
          path: '/blood',
          roles: ['admin', 'manager'],
          icon: 'fa-solid fa-droplet me-1',
        },
        {
          name: 'Category',
          path: '/category',
          roles: ['admin'],
          icon: 'fa-solid fa-layer-group me-1',
        },
        {
          name: 'Clients',
          path: '/client',
          roles: ['admin', 'manager'],
          icon: 'fa-solid fa-business-time me-1',
        },
        {
          name: 'Contractors',
          path: '/contractor',
          roles: ['admin', 'manager'],
          icon: 'fa-solid fa-building me-1',
        },
        {
          name: 'Course',
          path: '/course',
          roles: ['admin'],
          icon: 'fa-solid fa-graduation-cap me-1',
        },
        {
          name: 'DL Types',
          path: '/dltype',
          roles: ['admin', 'manager'],
          icon: 'fa-solid fa-id-badge me-1',
        },
        {
          name: 'Locations',
          path: '/location',
          roles: ['admin', 'manager'],
          icon: 'fa-solid fa-location-dot me-1',
        },
        {
          name: 'Results',
          path: '/result',
          roles: ['admin', 'manager'],
          icon: 'fa-solid fa-square-poll-vertical me-1',
        },
        {
          name: 'Stages',
          path: '/stage',
          roles: ['admin', 'manager'],
          icon: 'fa-solid fa-person-booth me-1',
        },
        {
          name: 'Titles',
          path: '/title',
          roles: ['admin', 'manager'],
          icon: 'fa-brands fa-phoenix-framework me-1',
        },
        {
          name: 'Vehicle',
          path: '/vehicle',
          roles: ['admin', 'manager'],
          icon: 'fa-solid fa-truck me-1',
        },
        {
          name: 'Visual',
          path: '/visual',
          roles: ['admin', 'manager'],
          icon: 'fa-solid fa-eye me-1',
        },
      ],
    },
    // {
    //   name: 'User',
    //   icon: 'fa-solid fa-circle-user me-1',
    //   id: 'user',
    //   roles: ['admin', 'manager', 'staff', 'member'],
    //   items: [
    //     {
    //       name: 'Profile',
    //       path: '/profile',
    //       roles: ['admin', 'manager', 'staff', 'member'],
    //       icon: 'fa-solid fa-user me-1',
    //     },
    //     {
    //       name: 'LogOut',
    //       path: '/login',
    //       roles: ['admin', 'manager', 'staff', 'member'],
    //       icon: 'fa-solid fa-right-from-bracket me-1',
    //     },
    //   ],
    // },
  ],
};
