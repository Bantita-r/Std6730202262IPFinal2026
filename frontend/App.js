import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text as NativeText,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const FONT_FAMILY = Platform.select({
  web: 'Leelawadee UI, Segoe UI, Tahoma, Arial, sans-serif',
  default: 'sans-serif',
});
const COLORS = {
  ink: '#201E1A',
  muted: '#777167',
  accent: '#A65E43',
  accentDark: '#884A34',
  accentSoft: '#F2E5DA',
  canvas: '#F4F0E8',
  surface: '#FFFDFA',
  line: '#E6DED2',
  olive: '#68735F',
  oliveSoft: '#E8ECE3',
  danger: '#A34F48',
  dangerSoft: '#F7E9E5',
};
const POSITION_OPTIONS = ['Software Engineer', 'Product Designer', 'Product Manager', 'HR Manager', 'Data Analyst', 'Marketing Specialist', 'Sales Executive', 'Accountant', 'Customer Support', 'Other'];
const ICONS = {
  people: '\u25CE',
  active: '\u2197',
  salary: '$',
  search: '\u2315',
  add: '+',
  spark: '\u2726',
  chart: '\u25B3',
  arrow: '\u2192',
  close: '\u00D7',
};

let authToken = '';

function Text({ style, ...props }) {
  return <NativeText {...props} style={[{ fontFamily: FONT_FAMILY }, style]} />;
}

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Could not connect to the server. Check your API URL and connection.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'The request could not be completed.');
  return data;
}

const formatMoney = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'THB',
  maximumFractionDigits: 0,
}).format(Number(value) || 0);

function IconBadge({ name, dark = false, small = false }) {
  return (
    <View style={[styles.iconBadge, small && styles.iconBadgeSmall, dark && styles.iconBadgeDark]}>
      <Text style={[styles.iconGlyph, small && styles.iconGlyphSmall, dark && styles.iconGlyphDark]}>{ICONS[name]}</Text>
    </View>
  );
}

function Button({ children, onPress, disabled = false, secondary = false, danger = false }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.78}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, secondary && styles.buttonSecondary, danger && styles.buttonDanger, disabled && styles.buttonDisabled]}
    >
      {children}
    </TouchableOpacity>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry, autoCapitalize }) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        autoCapitalize={autoCapitalize || 'sentences'}
        keyboardType={keyboardType || 'default'}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9A9489"
        secureTextEntry={secureTextEntry}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const avatarLooks = [
  { background: '#F1DDC9', skin: '#D69B73', hair: '#49342B', shirt: '#A65E43' },
  { background: '#E1E9DC', skin: '#E4B58E', hair: '#312923', shirt: '#68735F' },
  { background: '#E9DFEA', skin: '#C9855E', hair: '#4A302B', shirt: '#7C687E' },
  { background: '#E8E6D8', skin: '#E7BC98', hair: '#6A4936', shirt: '#A48655' },
  { background: '#E4E8EF', skin: '#B97856', hair: '#302821', shirt: '#64758A' },
];

function CartoonAvatar({ index }) {
  const look = avatarLooks[index % avatarLooks.length];
  return (
    <View style={[styles.avatarCanvas, { backgroundColor: look.background }]}>
      <View style={[styles.avatarBody, { backgroundColor: look.shirt }]} />
      <View style={[styles.avatarNeck, { backgroundColor: look.skin }]} />
      <View style={[styles.avatarHairBack, { backgroundColor: look.hair }]} />
      <View style={[styles.avatarEar, styles.avatarEarLeft, { backgroundColor: look.skin }]} />
      <View style={[styles.avatarEar, styles.avatarEarRight, { backgroundColor: look.skin }]} />
      <View style={[styles.avatarFace, { backgroundColor: look.skin }]} />
      <View style={[styles.avatarHairCap, { backgroundColor: look.hair }]} />
      <View style={styles.avatarEyes}><View style={styles.avatarEye} /><View style={styles.avatarEye} /></View>
      <View style={styles.avatarSmile} />
      <View style={styles.avatarCollar} />
    </View>
  );
}
function StatCard({ title, value, note, icon, compact = false, phone = false }) {
  return (
    <View style={[styles.statCard, phone && styles.statCardPhone]}>
      <View style={styles.statTop}>
        <Text style={[styles.statLabel, phone && styles.statLabelPhone]} numberOfLines={1}>{title}</Text>
        {!phone ? <IconBadge name={icon} small /> : null}
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.statValue, compact && styles.statValueCompact, phone && styles.statValuePhone]}>{value}</Text>
      <Text numberOfLines={1} style={[styles.statNote, phone && styles.statNotePhone]}>{note}</Text>
    </View>
  );
}

export default function App() {
  const { width, height } = useWindowDimensions();
  const isNarrow = width < 720;
  const isPhone = width < 540;
  const [token, setToken] = useState('');
  const [activePage, setActivePage] = useState('overview');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [otherPosition, setOtherPosition] = useState('');
  const [positionMenuOpen, setPositionMenuOpen] = useState(false);
  const [salary, setSalary] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [busy, setBusy] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [clusters, setClusters] = useState(null);

  const activeCount = useMemo(
    () => employees.filter((employee) => employee.status === 'Active').length,
    [employees],
  );
  const averageSalary = useMemo(() => (
    employees.length
      ? employees.reduce((sum, employee) => sum + Number(employee.salary), 0) / employees.length
      : 0
  ), [employees]);
  const filteredEmployees = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesQuery = !normalizedQuery || `${employee.name} ${employee.position}`.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === 'All' || employee.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [employees, query, statusFilter]);

  const refreshEmployees = useCallback(async () => {
    const result = await api('/employees');
    setEmployees(Array.isArray(result) ? result : result.employees || []);
  }, []);

  useEffect(() => {
    if (token) refreshEmployees().catch((requestError) => setError(requestError.message));
  }, [token, refreshEmployees]);

  const handleLogin = async () => {
    setBusy(true);
    setError('');
    try {
      const result = await api('/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password }),
      });
      authToken = result.token;
      setToken(result.token);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const handleAddEmployee = async () => {
    const numericSalary = Number(salary);
    const selectedPosition = position === 'Other' ? otherPosition.trim() : position.trim();
    if (!name.trim() || !selectedPosition || !salary.trim() || !Number.isFinite(numericSalary) || numericSalary < 0) {
      setError('Enter a name, position, and a valid non-negative salary.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await api('/employees', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), position: selectedPosition, salary: numericSalary }),
      });
      setName('');
      setPosition('');
      setOtherPosition('');
      setPositionMenuOpen(false);
      setSalary('');
      await refreshEmployees();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const handleToggleStatus = async (employee) => {
    setError('');
    try {
      const nextStatus = employee.status === 'Active' ? 'On Leave' : 'Active';
      await api(`/employees/${employee.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      await refreshEmployees();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleDelete = (employee) => {
    const removeEmployee = async () => {
      setError('');
      try {
        await api(`/employees/${employee.id}`, { method: 'DELETE' });
        await refreshEmployees();
      } catch (requestError) {
        setError(requestError.message);
      }
    };

    if (Platform.OS === 'web') {
      if (globalThis.confirm(`Delete ${employee.name}?`)) removeEmployee();
      return;
    }
    Alert.alert('Delete employee', `Are you sure you want to delete ${employee.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: removeEmployee },
    ]);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError('');
    try {
      const result = await api('/employees/salary-clusters');
      setClusters(result.clusters || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLogout = () => {
    authToken = '';
    setToken('');
    setClusters(null);
    setQuery('');
    setStatusFilter('All');
    setError('');
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.loginPage}>
        <StatusBar style="dark" />
        <View style={[styles.loginLayout, isNarrow && styles.loginLayoutNarrow]}>
          {!isNarrow ? (
            <View style={styles.loginStory}>
              <View style={styles.loginStoryOrb} />
              <Text style={styles.loginStoryKicker}>PEOPLE, WELL MANAGED</Text>
              <Text style={styles.loginStoryTitle}>Make room{ '\n' }for better work.</Text>
              <Text style={styles.loginStoryText}>A calmer way to manage your team and understand compensation.</Text>
              <View style={styles.loginStoryFoot}><IconBadge name="spark" dark /><Text style={styles.loginStoryFootText}>HR MANAGEMENT · SALARY INSIGHTS</Text></View>
            </View>
          ) : null}
          <View style={[styles.loginCard, isNarrow && styles.loginCardNarrow]}>
            <View style={styles.brandMark}><Text style={styles.brandMarkLetter}>h</Text></View>
            <Text style={styles.loginEyebrow}>HUMANLY / HR WORKSPACE</Text>
            <Text style={styles.loginTitle}>Welcome back.</Text>
            <Text style={styles.loginSubtitle}>Sign in to manage employee records and salary insights.</Text>
            <Field label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="Enter your username" />
            <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Enter your password" />
            {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
            <Button onPress={handleLogin} disabled={busy}>
              {busy ? <ActivityIndicator color={COLORS.surface} /> : <Text style={styles.buttonText}>Sign in  {ICONS.arrow}</Text>}
            </Button>
            <Text style={styles.demoHint}>Demo account: admin / password123</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

    return (
    <SafeAreaView style={styles.page}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.pageContent, isPhone && styles.pageContentPhone]} keyboardShouldPersistTaps="handled">
        <View style={[styles.topBar, isPhone && styles.topBarPhone]}>
          <View style={styles.brandLockup}>
            <View style={styles.smallBrandMark}><Text style={styles.brandMarkLetter}>h</Text></View>
            <View><Text style={styles.brandName}>HUMANLY</Text><Text style={styles.brandCaption}>PEOPLE OPERATIONS</Text></View>
          </View>
          <TouchableOpacity accessibilityRole="button" onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.navigation, isPhone && styles.navigationPhone]}>
          {[
            { id: 'overview', label: 'Overview', icon: 'spark' },
            { id: 'employees', label: 'Employees', icon: 'people' },
            { id: 'analytics', label: 'Salary insights', icon: 'chart' },
          ].map((tab) => (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ selected: activePage === tab.id }}
              key={tab.id}
              onPress={() => { setActivePage(tab.id); setError(''); }}
              style={[styles.navButton, activePage === tab.id && styles.navButtonActive]}
            >
              <Text style={[styles.navGlyph, activePage === tab.id && styles.navGlyphActive]}>{ICONS[tab.icon]}</Text>
              <Text style={[styles.navLabel, activePage === tab.id && styles.navLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

        {activePage === 'overview' ? (
          <View>
            <View style={[styles.hero, isNarrow && styles.heroNarrow, isPhone && styles.heroPhone]}>
              <View style={styles.heroCopy}>
                <View style={styles.heroKickerRow}><View style={styles.heroKickerDot} /><Text style={styles.heroKicker}>YOUR PEOPLE, AT A GLANCE</Text></View>
                <Text style={[styles.heroTitle, isPhone && styles.heroTitlePhone]}>Build a team{ '\n' }that thrives.</Text>
                <Text style={[styles.heroSubtitle, isPhone && styles.heroSubtitlePhone]}>Employee records and salary insights, all in one thoughtful workspace.</Text>
              </View>
              {!isNarrow ? <View style={styles.heroArt}>
                <View style={styles.heroRingOuter} /><View style={styles.heroRingInner} />
                <View style={styles.heroArtCenter}><IconBadge name="spark" dark /></View>
                <Text style={styles.heroArtCaption}>PEOPLE FIRST</Text>
              </View> : null}
              <View style={styles.heroCorner} />
            </View>

            <View style={[styles.statsGrid, isPhone && styles.statsGridPhone]}>
              <StatCard phone={isPhone} title="TEAM MEMBERS" value={employees.length} note="People in your workspace" icon="people" />
              <StatCard phone={isPhone} title="ACTIVE TODAY" value={activeCount} note="Currently at work" icon="active" />
              <StatCard phone={isPhone} title="AVERAGE SALARY" value={formatMoney(averageSalary)} note="Monthly compensation" icon="salary" compact />
            </View>

            <View style={[styles.sectionHeading, isPhone && { marginBottom: 8 }]}>
              <View><Text style={styles.sectionKicker}>QUICK ACCESS</Text><Text style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}>Where to next?</Text></View>
            </View>
            <View style={[styles.quickGrid, isNarrow && styles.quickGridNarrow, isPhone && styles.quickGridPhone]}>
              <TouchableOpacity accessibilityRole="button" activeOpacity={0.82} onPress={() => setActivePage('employees')} style={[styles.quickCard, isPhone && styles.quickCardPhone]}>
                <IconBadge name="people" />
                <Text style={[styles.quickTitle, isPhone && styles.quickTitlePhone]}>Your people</Text>
                {!isPhone ? <Text style={styles.quickDescription}>Search the directory, update employee status, or add someone to the team.</Text> : null}
                {!isPhone ? <Text style={styles.quickLink}>Open directory  {ICONS.arrow}</Text> : null}
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" activeOpacity={0.82} onPress={() => setActivePage('analytics')} style={[styles.quickCard, isPhone && styles.quickCardPhone]}>
                <IconBadge name="chart" />
                <Text style={[styles.quickTitle, isPhone && styles.quickTitlePhone]}>Salary insights</Text>
                {!isPhone ? <Text style={styles.quickDescription}>Explore salary tiers and see how compensation is distributed across your team.</Text> : null}
                {!isPhone ? <Text style={styles.quickLink}>View analytics  {ICONS.arrow}</Text> : null}
              </TouchableOpacity>
            </View>

            {!isPhone ? <View style={styles.recentSection}>
              <View style={styles.sectionHeading}>
                <View><Text style={styles.sectionKicker}>THE TEAM</Text><Text style={styles.sectionTitle}>Recently added</Text></View>
                <TouchableOpacity accessibilityRole="button" onPress={() => setActivePage('employees')}><Text style={styles.quickLink}>View all  {ICONS.arrow}</Text></TouchableOpacity>
              </View>
              {employees.length ? employees.slice(0, 3).map((employee, index) => (
                <View key={employee.id} style={styles.employeeCard}>
                  <CartoonAvatar index={index} />
                  <View style={styles.employeeInfo}><Text style={styles.employeeName}>{employee.name}</Text><Text style={styles.employeeRole}>{employee.position}</Text></View>
                  <View style={[styles.statusPill, employee.status === 'Active' ? styles.activePill : styles.leavePill]}>
                    <View style={[styles.statusDot, employee.status === 'Active' ? styles.activeDot : styles.leaveDot]} />
                    <Text style={[styles.statusText, employee.status === 'Active' ? styles.activeText : styles.leaveText]}>{employee.status}</Text>
                  </View>
                </View>
              )) : <Text style={styles.emptyText}>Your employee directory is ready for its first member.</Text>}
            </View> : null}
          </View>
        ) : null}

        {activePage === 'employees' ? (
          <View>
            <View style={styles.pageHeading}>
              <View><Text style={styles.sectionKicker}>TEAM DIRECTORY</Text><Text style={styles.sectionTitle}>Employees</Text><Text style={styles.pageSubtitle}>Search, manage, and grow your team.</Text></View>
              <Text style={styles.recordCount}>{employees.length} {employees.length === 1 ? 'person' : 'people'}</Text>
            </View>
            <View style={[styles.contentGrid, isNarrow && styles.contentGridNarrow]}>
              <View style={styles.directoryColumn}>
                <View style={styles.directoryTools}>
                  <View style={styles.searchBox}>
                    <Text style={styles.searchGlyph}>{ICONS.search}</Text>
                    <TextInput accessibilityLabel="Search employees" onChangeText={setQuery} placeholder="Search name or role" placeholderTextColor="#938D82" style={styles.searchInput} value={query} />
                    {query ? <TouchableOpacity accessibilityRole="button" onPress={() => setQuery('')}><Text style={styles.clearSearch}>{ICONS.close}</Text></TouchableOpacity> : null}
                  </View>
                  <View style={styles.filterRow}>
                    {['All', 'Active', 'On Leave'].map((filter) => (
                      <TouchableOpacity accessibilityRole="button" key={filter} onPress={() => setStatusFilter(filter)} style={[styles.filterChip, statusFilter === filter && styles.filterChipSelected]}>
                        <Text style={[styles.filterText, statusFilter === filter && styles.filterTextSelected]}>{filter}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.employeeList}>
                  {filteredEmployees.length ? filteredEmployees.map((employee, index) => (
                    <View key={employee.id} style={styles.employeeCard}>
                      <CartoonAvatar index={index} />
                      <View style={styles.employeeInfo}>
                        <Text style={styles.employeeName}>{employee.name}</Text>
                        <Text style={styles.employeeRole}>{employee.position}</Text>
                        <Text style={styles.employeeSalary}>{formatMoney(employee.salary)} <Text style={styles.perMonth}>/ month</Text></Text>
                      </View>
                      <View style={styles.employeeActions}>
                        <View style={[styles.statusPill, employee.status === 'Active' ? styles.activePill : styles.leavePill]}>
                          <View style={[styles.statusDot, employee.status === 'Active' ? styles.activeDot : styles.leaveDot]} />
                          <Text style={[styles.statusText, employee.status === 'Active' ? styles.activeText : styles.leaveText]}>{employee.status}</Text>
                        </View>
                        <View style={styles.actionRow}>
                          <TouchableOpacity accessibilityRole="button" onPress={() => handleToggleStatus(employee)} style={styles.textAction}><Text style={styles.textActionLabel}>Change status</Text></TouchableOpacity>
                          <TouchableOpacity accessibilityRole="button" onPress={() => handleDelete(employee)} style={styles.textAction}><Text style={styles.deleteActionLabel}>Delete</Text></TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )) : (
                    <View style={styles.emptyState}><IconBadge name="search" /><Text style={styles.emptyTitle}>No team members found</Text><Text style={styles.emptyText}>Try another search or change the status filter.</Text></View>
                  )}
                </View>
              </View>

              <View style={[styles.formCard, isNarrow && styles.formCardNarrow]}>
                <View style={styles.formHeadingRow}><View><Text style={styles.sectionKicker}>GROW YOUR TEAM</Text><Text style={styles.formTitle}>Add a person</Text></View><IconBadge name="add" /></View>
                <Text style={styles.formDescription}>Create a profile and keep your team details in one place.</Text>
                <Field label="Full name" value={name} onChangeText={setName} placeholder="e.g. Jordan Lee" />
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Position</Text>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityState={{ expanded: positionMenuOpen }}
                    onPress={() => setPositionMenuOpen((open) => !open)}
                    style={styles.selectInput}
                  >
                    <Text style={[styles.selectValue, !position && styles.selectPlaceholder]}>{position || 'Choose a position'}</Text>
                    <Text style={styles.selectChevron}>{positionMenuOpen ? '⌃' : '⌄'}</Text>
                  </TouchableOpacity>
                  {positionMenuOpen ? (
                    <View style={styles.selectMenu}>
                      {POSITION_OPTIONS.map((option) => (
                        <TouchableOpacity
                          key={option}
                          accessibilityRole="button"
                          accessibilityState={{ selected: position === option }}
                          onPress={() => { setPosition(option); setOtherPosition(''); setPositionMenuOpen(false); }}
                          style={[styles.selectOption, position === option && styles.selectOptionSelected]}
                        >
                          <Text style={[styles.selectOptionText, position === option && styles.selectOptionTextSelected]}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : null}
                </View>
                {position === 'Other' ? <Field label="Custom position" value={otherPosition} onChangeText={setOtherPosition} placeholder="Enter a job title" /> : null}
                <Field label="Monthly salary (THB)" value={salary} onChangeText={setSalary} keyboardType="decimal-pad" placeholder="e.g. 45000" />
                <Button onPress={handleAddEmployee} disabled={busy}>{busy ? <ActivityIndicator color={COLORS.surface} /> : <Text style={styles.buttonText}>Add to team  {ICONS.add}</Text>}</Button>
                <View style={styles.formFootnote}><Text style={styles.formFootnoteGlyph}>{ICONS.spark}</Text><Text style={styles.formFootnoteText}>Changes save to your database instantly.</Text></View>
              </View>
            </View>
          </View>
        ) : null}

        {activePage === 'analytics' ? (
          <View>
            <View style={styles.pageHeading}>
              <View><Text style={styles.sectionKicker}>COMPENSATION</Text><Text style={styles.sectionTitle}>Salary insights</Text><Text style={styles.pageSubtitle}>A clearer view of your team's salary structure.</Text></View>
            </View>
            <View style={styles.statsGrid}>
              <StatCard title="PEOPLE ANALYZED" value={employees.length} note="Current team members" icon="people" />
              <StatCard title="TEAM AVERAGE" value={formatMoney(averageSalary)} note="Monthly compensation" icon="salary" compact />
              <StatCard title="SALARY TIERS" value="3" note="K-Means groups" icon="chart" />
            </View>
            <View style={styles.analysisCard}>
              <View style={styles.analysisHeader}>
                <IconBadge name="chart" />
                <View style={styles.analysisHeadingCopy}><Text style={styles.analysisTitle}>Compensation landscape</Text><Text style={styles.analysisDescription}>K-Means clustering groups current salaries into three tiers.</Text></View>
              </View>
              <Button onPress={handleAnalyze} disabled={analyzing}>
                {analyzing ? <View style={styles.buttonInline}><ActivityIndicator color={COLORS.surface} /><Text style={styles.buttonText}>Analyzing...</Text></View> : <Text style={styles.buttonText}>Analyze salary structure  {ICONS.arrow}</Text>}
              </Button>
              {clusters?.length ? <View style={styles.clusterGrid}>
                {clusters.map((cluster, index) => (
                  <View key={cluster.group} style={styles.clusterCard}>
                    <View style={styles.clusterTop}><Text style={styles.clusterIndex}>0{index + 1}</Text><Text style={styles.clusterTier}>SALARY TIER</Text></View>
                    <Text style={styles.clusterName}>{cluster.group}</Text>
                    <Text style={styles.clusterSalary}>{formatMoney(cluster.average)}</Text>
                    <Text style={styles.clusterMeta}>{cluster.count} people · centroid {formatMoney(cluster.centroid)}</Text>
                    <View style={styles.clusterBar}><View style={[styles.clusterBarFill, { width: `${employees.length ? (cluster.count / employees.length) * 100 : 0}%` }]} /></View>
                  </View>
                ))}
              </View> : <View style={styles.analyticsEmpty}><IconBadge name="spark" /><Text style={styles.emptyTitle}>Your insights are one click away</Text><Text style={styles.emptyText}>Run the analysis to group salaries into three tiers.</Text></View>}
            </View>
          </View>
        ) : null}

        {!isPhone ? <Text style={styles.footer}>HUMANLY  /  HR MANAGER & SALARY ANALYTICS</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    navigation: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 7, borderRadius: 16, backgroundColor: '#EAE4DA', marginBottom: 24 },
  navigationPhone: { gap: 3, padding: 5, justifyContent: 'space-between', marginBottom: 12 },
  navButton: { flex: 1, minWidth: 105, minHeight: 46, borderRadius: 12, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  navButtonActive: { backgroundColor: COLORS.ink },
  navGlyph: { color: COLORS.muted, fontSize: 17, fontWeight: '800' },
  navGlyphActive: { color: '#E4C29F' },
  navLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
  navLabelActive: { color: COLORS.surface },
  quickGrid: { flexDirection: 'row', gap: 16, marginTop: 3 },
  quickGridNarrow: { flexDirection: 'column' },
  quickGridPhone: { flexDirection: 'row', gap: 8, marginTop: 0 },
  quickCard: { flex: 1, minWidth: 230, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 18, padding: 23 },
  quickCardPhone: { minWidth: 0, padding: 11, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  quickTitle: { color: COLORS.ink, fontSize: 20, fontWeight: '800', marginTop: 18 },
  quickTitlePhone: { fontSize: 12, marginTop: 0 },
  quickDescription: { color: COLORS.muted, fontSize: 14, lineHeight: 21, marginTop: 7, minHeight: 50 },
  quickLink: { color: COLORS.accentDark, fontSize: 13, fontWeight: '800', marginTop: 17 },
  recentSection: { marginTop: 30 },
  pageHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 },
  pageSubtitle: { color: COLORS.muted, fontSize: 14, lineHeight: 21, marginTop: 6 },
  analyticsEmpty: { alignItems: 'center', paddingVertical: 30, marginTop: 12, borderWidth: 1, borderColor: COLORS.line, borderStyle: 'dashed', borderRadius: 15 },
  clusterBar: { height: 5, backgroundColor: '#E8E0D5', borderRadius: 4, overflow: 'hidden', marginTop: 13 },
  clusterBarFill: { height: 5, backgroundColor: COLORS.accent, borderRadius: 4 },page: { flex: 1, backgroundColor: COLORS.canvas },
  pageContent: { width: '100%', maxWidth: 1320, alignSelf: 'center', paddingHorizontal: 38, paddingTop: 20, paddingBottom: 56 },
  pageContentPhone: { paddingHorizontal: 18, paddingTop: 12 },
  topBar: { minHeight: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  topBarPhone: { minHeight: 54, marginBottom: 10 },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  smallBrandMark: { width: 44, height: 44, borderRadius: 15, backgroundColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
  brandMarkLetter: { color: COLORS.surface, fontSize: 25, lineHeight: 30, fontWeight: '800' },
  brandName: { color: COLORS.ink, fontSize: 16, fontWeight: '900', letterSpacing: 2.1 },
  brandCaption: { color: COLORS.muted, fontSize: 10, letterSpacing: 1.5, marginTop: 3 },
  logoutButton: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.surface },
  logoutText: { color: COLORS.ink, fontSize: 14, fontWeight: '700' },
  hero: { minHeight: 294, borderRadius: 26, backgroundColor: COLORS.ink, paddingHorizontal: 42, paddingVertical: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden', marginBottom: 22 },
  heroNarrow: { minHeight: 0, paddingHorizontal: 24, paddingVertical: 30 },
  heroPhone: { paddingHorizontal: 18, paddingVertical: 16, marginBottom: 12, borderRadius: 20 },
  heroCopy: { flex: 1, maxWidth: 680, zIndex: 1 },
  heroKickerRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 13 },
  heroKickerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D59A73' },
  heroKicker: { color: '#D8CFC0', fontSize: 12, fontWeight: '800', letterSpacing: 2.2 },
  heroTitle: { color: COLORS.surface, fontSize: 50, lineHeight: 59, fontWeight: '800', letterSpacing: -1.5 },
  heroTitlePhone: { fontSize: 31, lineHeight: 36, letterSpacing: -0.6 },
  heroSubtitle: { color: '#D5CEC2', fontSize: 18, lineHeight: 28, marginTop: 16, maxWidth: 520 },
  heroSubtitlePhone: { fontSize: 13, lineHeight: 18, marginTop: 8 },
  heroArt: { width: 230, height: 205, alignItems: 'center', justifyContent: 'center', marginLeft: 20, marginRight: 10 },
  heroRingOuter: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderColor: '#655A4D' },
  heroRingInner: { position: 'absolute', width: 135, height: 135, borderRadius: 68, borderWidth: 1, borderColor: '#8A6B52' },
  heroArtCenter: { width: 76, height: 76, borderRadius: 26, backgroundColor: '#A65E43', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },
  heroArtCaption: { position: 'absolute', bottom: 0, color: '#D8CFC0', fontSize: 10, fontWeight: '800', letterSpacing: 2.2 },
  heroCorner: { position: 'absolute', width: 230, height: 230, borderRadius: 115, right: -135, top: -140, backgroundColor: '#29251F' },
  iconBadge: { width: 46, height: 46, borderRadius: 16, backgroundColor: COLORS.accentSoft, alignItems: 'center', justifyContent: 'center' },
  iconBadgeSmall: { width: 38, height: 38, borderRadius: 13 },
  iconBadgeDark: { backgroundColor: '#40372F' },
  iconGlyph: { color: COLORS.accentDark, fontSize: 23, lineHeight: 27, fontWeight: '700' },
  iconGlyphSmall: { fontSize: 19, lineHeight: 23 },
  iconGlyphDark: { color: '#E9C9A9', fontSize: 27 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 34 },
  statsGridPhone: { flexWrap: 'nowrap', gap: 7, marginBottom: 17 },
  statCard: { flex: 1, minWidth: 205, backgroundColor: COLORS.surface, borderRadius: 18, borderWidth: 1, borderColor: COLORS.line, padding: 23, minHeight: 160 },
  statCardPhone: { minWidth: 0, padding: 10, minHeight: 91, borderRadius: 14 },
  statTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1.15 },
  statLabelPhone: { fontSize: 8, letterSpacing: 0.2 },
  statValue: { color: COLORS.ink, fontSize: 38, lineHeight: 46, fontWeight: '800', marginTop: 13, letterSpacing: -0.8 },
  statValueCompact: { fontSize: 28 },
  statValuePhone: { fontSize: 19, lineHeight: 23, marginTop: 7, letterSpacing: -0.5 },
  statNote: { color: COLORS.muted, fontSize: 13, marginTop: 4 },
  statNotePhone: { fontSize: 9, marginTop: 2 },
  sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 15 },
  sectionKicker: { color: COLORS.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.8, marginBottom: 5 },
  sectionTitle: { color: COLORS.ink, fontSize: 29, fontWeight: '800', letterSpacing: -0.4 },
  sectionTitlePhone: { fontSize: 21, letterSpacing: -0.2 },
  recordCount: { color: COLORS.muted, fontSize: 13, paddingBottom: 5 },
  contentGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 18 },
  contentGridNarrow: { flexDirection: 'column' },
  directoryColumn: { flex: 1, minWidth: 320 },
  directoryTools: { gap: 12, marginBottom: 13 },
  searchBox: { minHeight: 53, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 10 },
  searchGlyph: { color: COLORS.accent, fontSize: 24, lineHeight: 27 },
  searchInput: { flex: 1, minWidth: 0, color: COLORS.ink, fontFamily: FONT_FAMILY, fontSize: 15, outlineStyle: 'none' },
  clearSearch: { color: COLORS.muted, fontSize: 22, paddingHorizontal: 5 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: '#ECE7DE' },
  filterChipSelected: { backgroundColor: COLORS.ink },
  filterText: { color: COLORS.muted, fontSize: 12, fontWeight: '700' },
  filterTextSelected: { color: COLORS.surface },
  employeeList: { gap: 11 },
  employeeCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 17, padding: 19, flexDirection: 'row', alignItems: 'center', gap: 15 },
    avatarCanvas: { width: 64, height: 64, borderRadius: 32, overflow: 'hidden', borderWidth: 2, borderColor: COLORS.surface },
  avatarBody: { position: 'absolute', width: 47, height: 29, left: 8, bottom: -7, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  avatarNeck: { position: 'absolute', width: 11, height: 13, left: 26, top: 37, borderRadius: 5 },
  avatarHairBack: { position: 'absolute', width: 34, height: 39, left: 15, top: 7, borderRadius: 18 },
  avatarEar: { position: 'absolute', width: 8, height: 10, top: 24, borderRadius: 5 },
  avatarEarLeft: { left: 14 },
  avatarEarRight: { right: 14 },
  avatarFace: { position: 'absolute', width: 27, height: 29, left: 18.5, top: 14, borderRadius: 14 },
  avatarHairCap: { position: 'absolute', width: 31, height: 17, left: 16.5, top: 9, borderTopLeftRadius: 17, borderTopRightRadius: 17, borderBottomLeftRadius: 7, borderBottomRightRadius: 7 },
  avatarEyes: { position: 'absolute', left: 25, top: 27, width: 15, flexDirection: 'row', justifyContent: 'space-between' },
  avatarEye: { width: 2.5, height: 3, borderRadius: 2, backgroundColor: '#302820' },
  avatarSmile: { position: 'absolute', left: 29, top: 35, width: 7, height: 3, borderBottomWidth: 1.5, borderColor: '#754A3D', borderRadius: 6 },
  avatarCollar: { position: 'absolute', width: 12, height: 5, left: 25, bottom: 11, backgroundColor: '#F8F2E8', borderBottomLeftRadius: 6, borderBottomRightRadius: 6 },
employeeInfo: { flex: 1, minWidth: 110 },
  employeeName: { color: COLORS.ink, fontSize: 17, fontWeight: '800' },
  employeeRole: { color: COLORS.muted, fontSize: 14, marginTop: 3 },
  employeeSalary: { color: COLORS.ink, fontSize: 15, fontWeight: '700', marginTop: 8 },
  perMonth: { color: COLORS.muted, fontSize: 12, fontWeight: '400' },
  employeeActions: { alignItems: 'flex-end', gap: 8 },
  statusPill: { borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 6 },
  activePill: { backgroundColor: COLORS.oliveSoft },
  leavePill: { backgroundColor: '#F2E9D9' },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  activeDot: { backgroundColor: COLORS.olive },
  leaveDot: { backgroundColor: '#A17C45' },
  statusText: { fontSize: 11, fontWeight: '800' },
  activeText: { color: '#52604B' },
  leaveText: { color: '#866533' },
  actionRow: { flexDirection: 'row', gap: 10 },
  textAction: { paddingVertical: 5, paddingHorizontal: 2 },
  textActionLabel: { color: COLORS.accentDark, fontSize: 12, fontWeight: '800' },
  deleteActionLabel: { color: COLORS.danger, fontSize: 12, fontWeight: '800' },
  formCard: { width: 350, maxWidth: '100%', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 19, padding: 24 },
  formCardNarrow: { width: '100%' },
  formHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  formTitle: { color: COLORS.ink, fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  formDescription: { color: COLORS.muted, fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 8 },
  field: { marginTop: 13 },
  fieldLabel: { color: COLORS.ink, fontSize: 13, fontWeight: '700', marginBottom: 7 },
  input: { minHeight: 53, borderWidth: 1, borderColor: COLORS.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: COLORS.ink, backgroundColor: '#FCFAF6', fontFamily: FONT_FAMILY, fontSize: 15, outlineStyle: 'none' },
  selectInput: { minHeight: 53, borderWidth: 1, borderColor: COLORS.line, borderRadius: 12, paddingHorizontal: 14, backgroundColor: '#FCFAF6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectValue: { color: COLORS.ink, fontFamily: FONT_FAMILY, fontSize: 15 },
  selectPlaceholder: { color: '#9A9489' },
  selectChevron: { color: COLORS.accentDark, fontSize: 20, lineHeight: 24, fontWeight: '800' },
  selectMenu: { marginTop: 6, borderWidth: 1, borderColor: COLORS.line, borderRadius: 12, backgroundColor: COLORS.surface, overflow: 'hidden' },
  selectOption: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  selectOptionSelected: { backgroundColor: COLORS.accentSoft },
  selectOptionText: { color: COLORS.ink, fontFamily: FONT_FAMILY, fontSize: 14 },
  selectOptionTextSelected: { color: COLORS.accentDark, fontWeight: '800' },
  button: { minHeight: 54, backgroundColor: COLORS.accent, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 17, paddingVertical: 12, marginTop: 17 },
  buttonSecondary: { backgroundColor: COLORS.olive },
  buttonDanger: { backgroundColor: COLORS.danger },
  buttonDisabled: { opacity: 0.62 },
  buttonText: { color: COLORS.surface, fontSize: 15, fontWeight: '800', letterSpacing: 0.15 },
  buttonInline: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  formFootnote: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  formFootnoteGlyph: { color: COLORS.accent, fontSize: 14 },
  formFootnoteText: { color: COLORS.muted, fontSize: 11 },
  analysisCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 18, padding: 22, marginTop: 19 },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 5 },
  analysisHeadingCopy: { flex: 1 },
  analysisTitle: { color: COLORS.ink, fontSize: 20, fontWeight: '800' },
  analysisDescription: { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  clusterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 15 },
  clusterCard: { flex: 1, minWidth: 175, backgroundColor: '#F7F3EC', borderRadius: 14, borderWidth: 1, borderColor: COLORS.line, padding: 15 },
  clusterTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clusterIndex: { color: COLORS.accent, fontSize: 17, fontWeight: '900' },
  clusterTier: { color: COLORS.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  clusterName: { color: COLORS.ink, fontSize: 15, fontWeight: '800', marginTop: 9 },
  clusterSalary: { color: COLORS.accentDark, fontSize: 22, fontWeight: '800', marginTop: 7 },
  clusterMeta: { color: COLORS.muted, fontSize: 11, lineHeight: 16, marginTop: 5 },
  emptyState: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 17, padding: 30, alignItems: 'center' },
  emptyTitle: { color: COLORS.ink, fontSize: 17, fontWeight: '800', marginTop: 12 },
  emptyText: { color: COLORS.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 5 },
  errorMessage: { color: '#873B35', backgroundColor: COLORS.dangerSoft, borderWidth: 1, borderColor: '#EBD5CF', borderRadius: 11, padding: 13, fontSize: 13, lineHeight: 19, marginBottom: 13 },
  footer: { color: '#9A9387', fontSize: 10, letterSpacing: 1.4, textAlign: 'center', marginTop: 32 },
  loginPage: { flex: 1, minHeight: '100%', backgroundColor: COLORS.canvas, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loginLayout: { width: '100%', maxWidth: 1040, flexDirection: 'row', alignItems: 'stretch', gap: 18 },
  loginLayoutNarrow: { maxWidth: 480, justifyContent: 'center' },
  loginStory: { flex: 1, minHeight: 535, backgroundColor: COLORS.ink, borderRadius: 24, padding: 42, justifyContent: 'center', overflow: 'hidden' },
  loginStoryOrb: { position: 'absolute', width: 290, height: 290, borderRadius: 145, right: -110, top: -100, backgroundColor: '#302820' },
  loginStoryKicker: { color: '#D7A27D', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  loginStoryTitle: { color: COLORS.surface, fontSize: 44, lineHeight: 53, fontWeight: '800', marginTop: 20, letterSpacing: -1 },
  loginStoryText: { color: '#D5CEC2', fontSize: 16, lineHeight: 25, maxWidth: 330, marginTop: 12 },
  loginStoryFoot: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 60 },
  loginStoryFootText: { color: '#D8CFC0', fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  loginCard: { flex: 1, minWidth: 350, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 24, padding: 36, justifyContent: 'center' },
  loginCardNarrow: { minWidth: 0, width: '100%' },
  brandMark: { width: 52, height: 52, borderRadius: 18, backgroundColor: COLORS.ink, alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
  loginEyebrow: { color: COLORS.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.7, marginBottom: 8 },
  loginTitle: { color: COLORS.ink, fontSize: 31, fontWeight: '800', letterSpacing: -0.7 },
  loginSubtitle: { color: COLORS.muted, fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 8 },
  demoHint: { color: COLORS.muted, fontSize: 11, textAlign: 'center', marginTop: 14 },
});