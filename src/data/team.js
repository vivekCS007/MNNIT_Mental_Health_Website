// ---------------------------------------------------------------------------
// TEAM DATA  (placeholder people — replace names/emails/phones later)
// ---------------------------------------------------------------------------
// Each member: { name, role, email, phone, qualification, expertise, photo }
//   - photo: leave as null for now -> the card shows an initials avatar.
//            Later, drop a file in src/assets/team/ and import it, then set
//            photo: <imported variable>.
// ---------------------------------------------------------------------------

export const TEAM = {
  Deans: {
    label: 'Deans',
    members: [
      {
        name: 'Prof. Neeraj Tyagi',
        role: 'Academic Affairs',
        email: 'neeraj@mnnit.ac.in',
        phone: '+91-05322271657',
        qualification: 'B.E (CS), M.E (CSED) and Ph.D MNNIT ',
        // expertise: 'Computer Network, Wireless Network, Mesh Network and Ad-hoc Network.',
        photo: 'src/assets/team/neeraj.jpg'
      },
      {
        name: 'Prof. Vinay Kumar Srivastava',
        role: 'Faculty Welfare',
        email: 'vinay@mnnit.ac.in',
        phone: '+91-9140228182',
        qualification: 'B.E.(Electronics & Telecommunication) , M.Tech.(Communication Systems),Ph.D.EE/IIT Kanpur. ',
        // expertise: 'Image Processing, Image watermarking, Data security in e-healthcare applications, Digital Signal Processing, Communication Systems.',
        photo: 'src/assets/team/vinay.jpg'
      },
      {
        name: 'Prof. Asheesh Kumar Singh',
        role: 'Students Welfare',
        email: 'asheesh@mnnit.ac.in',
        phone: '+91-9455133600',
        qualification: 'B.Tech(Electrical Engineering), M.Tech.(Control systems, Department of Electrical Engineering), Ph.D(Department of Electronics and Computer Engineering).',
        // expertise: 'Deep Learning-based Fault Diagnosis, Power quality, Microgrids, E-mobility, Renewable Energy Integration in Distribution System.',
        photo: 'src/assets/team/Ashish.jpg'
      }
    ]
  },

  counsellors: {
    label: 'Counsellors',
    members: [
      {
        name: 'Dr. Kamlesh Kumar',
        role: 'Professional Counsellor / Psychologist',
        email: 'drkamlesh50@gmail.com',
        phone: '+91-8765626540',
        qualification: 'M.Phil. in Clinical Psychology',
        expertise: 'CBT, REBT, psychodiagnostic assessment.',
        photo: null
      },
      {
        name: 'Mrs. Kalpana Srivastava',
        role: 'Professional Counsellor / Psychologist',
        email: 'kalpansrivastava509@gmail.com',
        phone: '+91-9695930890',
        qualification: "Master's in Psychology",
        expertise: 'Trauma-informed care, mindfulness-based interventions.',
        photo: null
      },
      // {
      //   name: 'Sneha Iyer',
      //   role: 'Assistant Counsellor',
      //   email: 'sneha.counsellor@mnnit.ac.in',
      //   phone: '+91-512-2259-203',
      //   qualification: "Master's in Applied Psychology",
      //   expertise: 'DBT, ACT, crisis intervention.',
      //   photo: null
      // }
    ]
  },

  psychiatrists: {
    label: 'Psychiatrists',
    members: [
      {
       name: 'Dr. Kamlesh Kumar',
        role: 'Professional Counsellor / Psychologist',
        email: 'drkamlesh50@gmail.com',
        phone: '+91-8765626540',
        qualification: 'M.Phil. in Clinical Psychology',
       expertise: 'CBT, REBT, psychodiagnostic assessment.',
        photo: null
      },
      {
        name: 'Mrs. Kalpana Srivastava',
        role: 'Professional Counsellor / Psychologist',
        email: 'kalpansrivastava509@gmail.com',
        phone: '+91-9695930890',
        qualification: "Master's in Psychology",
        expertise: 'Trauma-informed care, mindfulness-based interventions.',
        photo: null
      },
      {
    name: 'Dr. Pushkar Nigam',
    role: 'Neuro Physician',
    email: 'Pushkar509@gmail.com',
        phone: '+91-9695156514',
        qualification: "Master's in Psychology",
        expertise: 'Brain Neuroplasticity, mindfulness-based interventions.',
        photo: null
}
    ]
  },
    faculty: {
        label: 'Faculty',
        members: [
        {
            name: 'Dr. Dinesh Singh',
            role: 'Faculty In-Charge Boys',
            email: 'dinesh_singh@mnnit.ac.in',
            phone: '+91-9455421546',
            qualification: 'B.Tech (Electrical Engineering), M.Tech (Control Systems), Ph.D (Electronics & Computer Engineering)',
            profileUrl: 'https://mnnit.ac.in/profile/dinesh_singh',
            photo: 'src/assets/team/dinesh.jpg'
        },
        {
            name: 'Dr. Rajitha B',
            role: 'Faculty In-charge Girls',
            email: 'rajitha@mnnit.ac.in',
            phone: '+91-8052355544',
            qualification: 'B.Tech (Computer Science & IT), M.E. (Computer Science & Engineering), Ph.D',
            profileUrl: 'https://mnnit.ac.in/profile/rajitha',
            photo: 'src/assets/team/Rajitha.jpg'
        },
        {
            name: 'Dr. Abhishek Kundu',
            role: 'Faculty In-charge Boys',
            email: 'abhishekkunduamd@mnnit.ac.in',
            phone: '+91-8420247761',
            qualification: 'B.Tech (Mechanical Engineering), Ph.D (Computational Fluid Dynamics)',
            // expertise: 'Image Processing, Medical Image Processing, Multimedia Processing, Machine Learning in Computer Vision, Deep Learning in Computer Vision, Quantum Machine Learning.',
            photo: 'src/assets/team/abhishek.jpeg'
        },
        {
            name: 'Dr. Kanika Saxena',
            role: 'Faculty In-charge Girls',
            email: 'kanika@mnnit.ac.in',
            phone: '+91-9915856595',
            qualification: 'B.Tech (Civil Engineering), M.Tech (Environmental Engineering), Ph.D (Civil Engineering)',
            profileUrl: 'https://mnnit.ac.in/profile/kanika',
            photo: 'src/assets/team/kanika.jpeg'
        }
        ]
    },

  office: {
    label: 'Office Staff',
    members: [
      {
        name: 'Mohd Danish Ansari',
        role: 'Deputy Registrar (Student Welfare)',
        email: 'danishar@mnnit.ac.in',
        phone: '9335162848',
        qualification: '',
        expertise: '',
        photo: null
      },
      {
        name: 'Mr. Prem Chandra',
        role: 'Senior Assistant',
        email: 'officedeansw@gmail.com',
        phone: '9415014474',
        qualification: '',
        expertise: '',
        photo: null
      },
      {
        name: 'Mr. Shiv Shankar',
        role: '',
        email: 'shivshankar301978@gmil.com',
        phone: '0532-227-1039',
        qualification: '',
        expertise: '',
        photo: null
      },
      {
        name: 'Mr. Avdhesh Verma',
        role: '',
        email: 'avdheshverma0532@gmail.com',
        phone: '0532-227-1039',
        qualification: '',
        expertise: '',
        photo: null
      }
    ]
  },

  ugTeam: {
    label: 'UG Team',
    members: [
      {
        name: 'Aditya Kumar',
        role: 'UG Volunteer',
        email: 'aditya@mnnit.ac.in',
        phone: '+91-90000-00001',
        qualification: '',
        expertise: '',
        photo: null
      },
      {
        name: 'Riya Sharma',
        role: 'UG Volunteer',
        email: 'riya@mnnit.ac.in',
        phone: '+91-90000-00002',
        qualification: '',
        expertise: '',
        photo: null
      },
      {
        name: 'Karan Patel',
        role: 'UG Volunteer',
        email: 'karan@mnnit.ac.in',
        phone: '+91-90000-00003',
        qualification: '',
        expertise: '',
        photo: null
      },
      {
        name: 'Neha Verma',
        role: 'UG Volunteer',
        email: 'neha@mnnit.ac.in',
        phone: '+91-90000-00004',
        qualification: '',
        expertise: '',
        photo: null
      }
    ]
  },

  pgTeam: {
    label: 'PG Team',
    members: [
      {
        name: 'Rahul Yadav',
        role: 'PG Volunteer',
        email: 'rahul.2024rcs07@mnnit.ac.in ',
        phone: '+91-7318178453',
        qualification: '',
        expertise: '',
        photo: null
      },
      {
        name: 'Arnab Sahoo',
        role: 'PG Volunteer',
        email: 'arnab.2025ds04@mnnit.ac.in ',
        phone: '+91-9932333757',
        qualification: '',
        expertise: '',
        photo: 'src/assets/team/arnab.jpg'
      },
      {
        name: 'Utkarsh Verma',
        role: 'PG Volunteer',
        email: 'arnab.2025ds21@mnnit.ac.in',
        phone: '+91-9026584799',
        qualification: '',
        expertise: '',
        photo: 'src/assets/team/utkarsh.jpg'
      },
      {
        name: 'Pooja Reddy',
        role: 'PG Volunteer',
        email: 'pooja@mnnit.ac.in',
        phone: '+91-90000-00008',
        qualification: '',
        expertise: '',
        photo: null
      }
    ]
  }
}

// Order the tabs appear in.
export const TEAM_SECTION_ORDER = [
  'Deans',
  'counsellors',
  'faculty',
  'office',
  'ugTeam',
  'pgTeam'
]