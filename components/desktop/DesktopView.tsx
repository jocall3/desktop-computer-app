// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.
// This file represents the core Desktop Operating Environment, codenamed "Project Atlas".

import React, { useState, useCallback, useEffect, createContext, useContext, useRef, useMemo } from 'react';
import { FeatureDock } from './FeatureDock';
import { Window } from './Window';
import { Taskbar } from './Taskbar';
import { ALL_FEATURES } from '../features';
import type { Feature, ViewType } from '../../types';
import { ActionManager } from '../ActionManager';

// --- Invented Type Definitions for Project Atlas Core Services ---
interface WindowState {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isResizing: boolean;
  isDragging: boolean;
  desktopId: string;
  opacity: number;
}

export interface VirtualDesktop {
  id: string;
  name: string;
  wallpaperUrl: string;
  widgets: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'system';
  timestamp: Date;
  action?: { label: string; callback: () => void };
  isRead: boolean;
  duration?: number;
  icon?: string;
}

export interface UserProfile {
  userId: string;
  username: string;
  themeId: string;
  settings: Record<string, any>;
  lastLogin: Date;
  permissions: string[];
}

export interface DesktopTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontFamily: string;
  iconSet: string;
  cursorSet: string;
  windowBorderRadius: string;
  taskbarOpacity: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'feature' | 'document' | 'setting' | 'contact' | 'web' | 'action';
  score: number;
  action: () => void;
}

export interface ClipboardItem {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'url';
  timestamp: Date;
}

export interface AIResponse {
  sessionId: string;
  query: string;
  response: string;
  timestamp: Date;
  toolSuggestions?: { label: string; action: () => void }[];
  confidenceScore?: number;
  sourceDocuments?: { title: string; url: string }[];
}

export interface SystemResourceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkRx: number;
  networkTx: number;
  diskIO: number;
  timestamp: Date;
}

export interface SystemConfig {
  defaultThemeId: string;
  enableTelemetry: boolean;
  enableAIAssistant: boolean;
  maxNotifications: number;
  idleTimeoutMinutes: number;
  multiMonitorEnabled: boolean;
  securityLevel: 'low' | 'medium' | 'high' | 'paranoid';
  auditLoggingEnabled: boolean;
  dataEncryptionEnabled: boolean;
}

const Z_INDEX_BASE = 10;

// --- Utility Functions ---

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function generateUniqueId(): string {
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function calculatePerformanceMetrics(): SystemResourceMetrics {
    const now = new Date();
    const cpuUsage = Math.min(100, Math.max(0, 20 + Math.sin(now.getTime() / 10000) * 15 + Math.random() * 5));
    const memoryUsage = Math.min(8192, Math.max(1024, 2048 + Math.cos(now.getTime() / 15000) * 1024 + Math.random() * 500));
    const networkRx = Math.min(1000, Math.max(0, 50 + Math.random() * 200));
    const networkTx = Math.min(500, Math.max(0, 20 + Math.random() * 100));
    const diskIO = Math.min(50, Math.max(0, 5 + Math.random() * 10));

    return {
        cpuUsage: parseFloat(cpuUsage.toFixed(2)),
        memoryUsage: parseFloat(memoryUsage.toFixed(2)),
        networkRx: parseFloat(networkRx.toFixed(2)),
        networkTx: parseFloat(networkTx.toFixed(2)),
        diskIO: parseFloat(diskIO.toFixed(2)),
        timestamp: now,
    };
}

// --- Services ---

export class TelemetryService {
  private static instance: TelemetryService;
  private config: SystemConfig;

  private constructor(config: SystemConfig) {
    this.config = config;
  }

  public static getInstance(config: SystemConfig): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService(config);
    }
    TelemetryService.instance.config = config;
    return TelemetryService.instance;
  }

  public recordEvent(eventName: string, payload: Record<string, any> = {}): void {
    if (!this.config.enableTelemetry) return;
    // console.log(`[Telemetry] ${eventName}`, payload);
  }

  public recordError(error: Error, info: any = {}): void {
    if (!this.config.enableTelemetry) return;
    console.error('[Telemetry Error]', error, info);
  }
}

export class AIService {
  private static instance: AIService;
  private config: SystemConfig;

  private constructor(config: SystemConfig) {
    this.config = config;
  }

  public static getInstance(config: SystemConfig): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService(config);
    }
    AIService.instance.config = config;
    return AIService.instance;
  }

  public async queryAI(query: string, modelPreference: 'gemini' | 'chatgpt' | 'auto' = 'auto', context: Record<string, any> = {}): Promise<AIResponse> {
    if (!this.config.enableAIAssistant) {
      throw new Error('AI Assistant disabled.');
    }
    
    // Mock Response
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                sessionId: generateUniqueId(),
                query,
                response: `This is a simulated AI response for: "${query}". In a real environment, this would call the Gemini API.`,
                timestamp: new Date(),
                toolSuggestions: query.toLowerCase().includes('calculator') ? [{ label: 'Open Calculator', action: () => ActionManager.executeAction('open_feature', { featureId: 'calculator' }) }] : [],
                confidenceScore: 0.95
            });
        }, 1000);
    });
  }
}

export class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private listeners: Set<() => void> = new Set();
  private config: SystemConfig;

  private constructor(config: SystemConfig) {
    this.config = config;
  }

  public static getInstance(config: SystemConfig): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(config);
    }
    NotificationService.instance.config = config;
    return NotificationService.instance;
  }

  public addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): string {
    const id = generateUniqueId();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      isRead: false,
    };
    this.notifications = [newNotification, ...this.notifications].slice(0, this.config.maxNotifications);
    this.notifyListeners();
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => this.dismissNotification(id), newNotification.duration);
    }
    return id;
  }

  public getNotifications(): Notification[] {
    return [...this.notifications];
  }

  public dismissNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  public markAsRead(id: string): void {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    this.notifyListeners();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

export class SystemConfigService {
  private static instance: SystemConfigService;
  private config: SystemConfig;
  private listeners: Set<(config: SystemConfig) => void> = new Set();

  private constructor() {
    this.config = {
      defaultThemeId: 'atlas-dark',
      enableTelemetry: true,
      enableAIAssistant: true,
      maxNotifications: 50,
      idleTimeoutMinutes: 15,
      multiMonitorEnabled: true,
      securityLevel: 'medium',
      auditLoggingEnabled: true,
      dataEncryptionEnabled: true,
    };
  }

  public static getInstance(): SystemConfigService {
    if (!SystemConfigService.instance) {
      SystemConfigService.instance = new SystemConfigService();
    }
    return SystemConfigService.instance;
  }

  public getConfig(): SystemConfig {
    return { ...this.config };
  }

  public subscribe(listener: (config: SystemConfig) => void): () => void {
    this.listeners.add(listener);
    listener(this.config);
    return () => this.listeners.delete(listener);
  }
}

export class ThemeService {
  private static instance: ThemeService;
  private currentTheme: DesktopTheme;
  private availableThemes: Record<string, DesktopTheme>;
  private listeners: Set<(theme: DesktopTheme) => void> = new Set();

  private constructor() {
    this.availableThemes = {
      'atlas-dark': {
        id: 'atlas-dark', name: 'Atlas Dark', primaryColor: '#2C3E50', secondaryColor: '#34495E',
        accentColor: '#3498DB', backgroundColor: '#1E2B38', fontFamily: 'Roboto, sans-serif',
        iconSet: 'material-dark', cursorSet: 'default', windowBorderRadius: '8px', taskbarOpacity: 0.95
      },
      'citibank-corporate': {
        id: 'citibank-corporate', name: 'Citibank Corporate', primaryColor: '#003151', secondaryColor: '#004772',
        accentColor: '#F58220', backgroundColor: '#F8F9FA', fontFamily: '"Citibank Sans", Arial, sans-serif',
        iconSet: 'citibank-vector', cursorSet: 'citibank', windowBorderRadius: '6px', taskbarOpacity: 0.98
      }
    };
    this.currentTheme = this.availableThemes['atlas-dark'];
    this.applyThemeToDOM(this.currentTheme);
  }

  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  public getAvailableThemes() { return { ...this.availableThemes }; }
  public getCurrentTheme() { return { ...this.currentTheme }; }

  public applyTheme(themeId: string): void {
    const newTheme = this.availableThemes[themeId];
    if (newTheme) {
      this.currentTheme = newTheme;
      this.applyThemeToDOM(newTheme);
      this.notifyListeners();
    }
  }

  private applyThemeToDOM(theme: DesktopTheme): void {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    root.style.setProperty('--background-color', theme.backgroundColor);
    document.body.className = `atlas-theme-${theme.id}`;
  }

  public subscribe(listener: (theme: DesktopTheme) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentTheme);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentTheme));
  }
}

export class VirtualDesktopService {
  private static instance: VirtualDesktopService;
  private desktops: VirtualDesktop[];
  private activeDesktopId: string;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.desktops = [
      { id: 'desktop-1', name: 'Main Workspace', wallpaperUrl: 'https://picsum.photos/1920/1080?random=1', widgets: [] },
      { id: 'desktop-2', name: 'Financial Analysis', wallpaperUrl: 'https://picsum.photos/1920/1080?random=2', widgets: [] },
    ];
    this.activeDesktopId = this.desktops[0].id;
  }

  public static getInstance(): VirtualDesktopService {
    if (!VirtualDesktopService.instance) {
      VirtualDesktopService.instance = new VirtualDesktopService();
    }
    return VirtualDesktopService.instance;
  }

  public getDesktops() { return [...this.desktops]; }
  public getActiveDesktopId() { return this.activeDesktopId; }

  public setActiveDesktop(id: string): void {
    if (this.desktops.some(d => d.id === id) && this.activeDesktopId !== id) {
      this.activeDesktopId = id;
      this.notifyListeners();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

export class SearchService {
  private static instance: SearchService;
  private searchableItems: Map<string, Omit<SearchResult, 'score'>> = new Map();
  private config: SystemConfig;

  private constructor(config: SystemConfig) {
    this.config = config;
    ALL_FEATURES.forEach(f => this.indexItem({
      id: `feature-${f.id}`,
      title: f.name,
      description: f.description,
      icon: f.icon,
      type: 'feature',
      action: () => ActionManager.executeAction('open_feature', { featureId: f.id })
    }));
  }

  public static getInstance(config: SystemConfig): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService(config);
    }
    SearchService.instance.config = config;
    return SearchService.instance;
  }

  public indexItem(item: Omit<SearchResult, 'score'>): void {
    this.searchableItems.set(item.id, item);
  }

  public search(query: string): SearchResult[] {
    const lowerQuery = query.toLowerCase();
    if (!lowerQuery.trim()) return [];

    const results: SearchResult[] = [];
    this.searchableItems.forEach(item => {
      let score = 0;
      if (item.title.toLowerCase().includes(lowerQuery)) score += 10;
      if (score > 0) results.push({ ...item, score });
    });

    return results.sort((a, b) => b.score - a.score);
  }
}

export class ClipboardService {
  private static instance: ClipboardService;
  private history: ClipboardItem[] = [];

  private constructor() {
    this.addHistoryItem({ content: 'Sample clipboard item', type: 'text' });
  }

  public static getInstance(): ClipboardService {
    if (!ClipboardService.instance) {
      ClipboardService.instance = new ClipboardService();
    }
    return ClipboardService.instance;
  }

  public addHistoryItem(item: Omit<ClipboardItem, 'id' | 'timestamp'>): ClipboardItem {
    const newItem: ClipboardItem = {
      id: generateUniqueId(),
      timestamp: new Date(),
      ...item,
    };
    this.history = [newItem, ...this.history];
    return newItem;
  }
}

export interface IAuthenticationService {
  login(credentials: any): Promise<UserProfile>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<UserProfile | null>;
  subscribeAuthChange(listener: (user: UserProfile | null) => void): () => void;
}

export class MockAuthenticationService implements IAuthenticationService {
  private currentUser: UserProfile | null = null;
  private listeners: Set<(user: UserProfile | null) => void> = new Set();

  async login(credentials: any): Promise<UserProfile> {
    this.currentUser = {
      userId: 'user123',
      username: credentials.username || 'demoUser',
      themeId: 'atlas-dark',
      settings: {},
      lastLogin: new Date(),
      permissions: ['feature:read', 'feature:write'],
    };
    this.notifyListeners();
    return this.currentUser;
  }
  async logout(): Promise<void> {
    this.currentUser = null;
    this.notifyListeners();
  }
  async getCurrentUser(): Promise<UserProfile | null> {
    return Promise.resolve(this.currentUser);
  }
  subscribeAuthChange(listener: (user: UserProfile | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentUser);
    return () => this.listeners.delete(listener);
  }
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentUser));
  }
}

export interface IMonitoringService {
  logMetric(name: string, value: number, tags?: Record<string, string>): Promise<void>;
}
export class MockMonitoringService implements IMonitoringService {
  async logMetric(name: string, value: number, tags?: Record<string, string>): Promise<void> {
    // Mock
  }
}

export class ServiceLocator {
  private static configService: SystemConfigService;
  private static telemetryService: TelemetryService;
  private static aiService: AIService;
  private static notificationService: NotificationService;
  private static themeService: ThemeService;
  private static virtualDesktopService: VirtualDesktopService;
  private static searchService: SearchService;
  private static clipboardService: ClipboardService;
  private static authService: IAuthenticationService;
  private static monitoringService: IMonitoringService;

  public static initialize(): void {
    this.configService = SystemConfigService.getInstance();
    const config = this.configService.getConfig();
    this.telemetryService = TelemetryService.getInstance(config);
    this.aiService = AIService.getInstance(config);
    this.notificationService = NotificationService.getInstance(config);
    this.themeService = ThemeService.getInstance();
    this.virtualDesktopService = VirtualDesktopService.getInstance();
    this.searchService = SearchService.getInstance(config);
    this.clipboardService = ClipboardService.getInstance();
    this.authService = new MockAuthenticationService();
    this.monitoringService = new MockMonitoringService();

    ActionManager.registerAction('show_notification', (payload: any) => this.getNotificationService().addNotification(payload));
    ActionManager.registerAction('ai_query', async (payload: { query: string, context?: any }) => {
        const response = await this.getAIService().queryAI(payload.query);
        this.getNotificationService().addNotification({ title: 'AI', message: response.response, type: 'info' });
    });
  }

  public static getConfigService(): SystemConfigService { return this.configService; }
  public static getTelemetryService(): TelemetryService { return this.telemetryService; }
  public static getAIService(): AIService { return this.aiService; }
  public static getNotificationService(): NotificationService { return this.notificationService; }
  public static getThemeService(): ThemeService { return this.themeService; }
  public static getVirtualDesktopService(): VirtualDesktopService { return this.virtualDesktopService; }
  public static getSearchService(): SearchService { return this.searchService; }
  public static getClipboardService(): ClipboardService { return this.clipboardService; }
  public static getAuthenticationService(): IAuthenticationService { return this.authService; }
  public static getMonitoringService(): IMonitoringService { return this.monitoringService; }
}

ServiceLocator.initialize();

export const SystemServicesContext = createContext({
  config: ServiceLocator.getConfigService(),
  telemetry: ServiceLocator.getTelemetryService(),
  ai: ServiceLocator.getAIService(),
  notifications: ServiceLocator.getNotificationService(),
  theme: ServiceLocator.getThemeService(),
  virtualDesktops: ServiceLocator.getVirtualDesktopService(),
  search: ServiceLocator.getSearchService(),
  clipboard: ServiceLocator.getClipboardService(),
  auth: ServiceLocator.getAuthenticationService(),
  monitoring: ServiceLocator.getMonitoringService(),
});

export const useSystemServices = () => useContext(SystemServicesContext);

// --- React Components ---

export const SystemNotificationDisplay: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { notifications: notificationService } = useSystemServices();

  useEffect(() => {
    const updateNotifications = () => {
      setNotifications(notificationService.getNotifications());
    };
    const unsubscribe = notificationService.subscribe(updateNotifications);
    updateNotifications();
    return () => unsubscribe();
  }, [notificationService]);

  return (
    <div className="absolute top-4 right-4 z-[var(--atlas-notification-z-index, 10000)] space-y-2 pointer-events-none">
      {notifications.map(notif => (
        <div key={notif.id} className="bg-gray-800 text-white p-4 rounded shadow-lg pointer-events-auto border-l-4 border-blue-500">
          <h3 className="font-bold">{notif.title}</h3>
          <p className="text-sm">{notif.message}</p>
        </div>
      ))}
    </div>
  );
};

export const SystemSearchOverlay: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const { search: searchService } = useSystemServices();

  useEffect(() => {
    if (isOpen) setSearchResults(searchService.search(searchTerm));
  }, [searchTerm, isOpen, searchService]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-start pt-20 z-[9000]" onClick={onClose}>
      <div className="bg-gray-800 p-6 rounded-lg w-3/4 max-w-2xl" onClick={e => e.stopPropagation()}>
        <input
          autoFocus
          className="w-full p-3 bg-gray-700 text-white rounded"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div className="mt-4 max-h-96 overflow-y-auto">
          {searchResults.map(r => (
            <div key={r.id} className="p-2 hover:bg-gray-700 cursor-pointer flex items-center" onClick={() => { r.action(); onClose(); }}>
              <span className="mr-3">{r.icon}</span>
              <div>
                  <div className="font-bold text-white">{r.title}</div>
                  <div className="text-xs text-gray-400">{r.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export interface DesktopWidgetProps {
    widgetId: string;
    onClose: () => void;
    position: { x: number; y: number };
    onUpdatePosition: (newPosition: { x: number; y: number }) => void;
}

const ALL_WIDGETS = new Map<string, { name: string; icon: string; Component: React.FC<DesktopWidgetProps>; }>([
    ['clock-widget', {
        name: 'Clock', icon: '⏰',
        Component: ({ onClose, position, onUpdatePosition }) => (
            <div className="p-4 bg-gray-800/80 rounded shadow text-white relative cursor-grab group"
                onMouseDown={(e) => { /* simplified drag logic for brevity would go here, assuming container handles it or similar to Window */ }}
            >
                <div className="font-mono text-2xl">{new Date().toLocaleTimeString()}</div>
                <button onClick={onClose} className="absolute -top-2 -right-2 bg-red-500 rounded-full w-4 h-4 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100">×</button>
            </div>
        )
    }]
]);

export const SystemStatusMonitor: React.FC = () => {
    const [metrics, setMetrics] = useState<SystemResourceMetrics | null>(null);
    const { monitoring: monitoringService, config: configService } = useSystemServices();
    const config = configService.getConfig();

    useEffect(() => {
        if (!config.enableTelemetry) return;
        const interval = setInterval(() => {
            const currentMetrics = calculatePerformanceMetrics();
            setMetrics(currentMetrics);
        }, 5000);
        return () => clearInterval(interval);
    }, [config.enableTelemetry]);

    if (!metrics) return null;

    return (
        <div className="absolute bottom-16 left-4 p-2 bg-black/50 text-white rounded text-[10px] pointer-events-none z-0">
            <div>CPU: {metrics.cpuUsage}%</div>
            <div>MEM: {metrics.memoryUsage}MB</div>
        </div>
    );
};

export const DesktopContextMenu: React.FC<{
    position: { x: number; y: number } | null;
    onClose: () => void;
    onOpenFeature: (id: string) => void;
    onSwitchTheme: (id: string) => void;
    onLogout: () => void;
}> = ({ position, onClose, onOpenFeature, onSwitchTheme, onLogout }) => {
    if (!position) return null;
    const { theme } = useSystemServices();

    return (
        <div className="absolute bg-gray-900 border border-gray-700 rounded shadow-xl py-1 z-[9999] w-48 text-sm text-gray-300"
             style={{ left: position.x, top: position.y }}
             onMouseLeave={onClose}
             onClick={e => e.stopPropagation()}
        >
            <div className="px-3 py-2 hover:bg-gray-800 cursor-pointer" onClick={() => { onOpenFeature('settings'); onClose(); }}>Settings</div>
            <div className="px-3 py-2 hover:bg-gray-800 cursor-pointer group relative">
                Themes
                <div className="absolute left-full top-0 bg-gray-900 border border-gray-700 rounded w-40 hidden group-hover:block">
                     {Object.values(theme.getAvailableThemes()).map(t => (
                         <div key={t.id} className="px-3 py-2 hover:bg-gray-800 cursor-pointer" onClick={() => { onSwitchTheme(t.id); onClose(); }}>{t.name}</div>
                     ))}
                </div>
            </div>
            <div className="h-px bg-gray-700 my-1"></div>
            <div className="px-3 py-2 hover:bg-red-900/50 text-red-400 cursor-pointer" onClick={onLogout}>Logout</div>
        </div>
    );
};

export const ScreenLocker: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
    const [password, setPassword] = useState('');
    return (
        <div className="fixed inset-0 bg-gray-900 z-[10000] flex items-center justify-center flex-col text-white">
            <h1 className="text-3xl font-bold mb-4">Project Atlas</h1>
            <p className="mb-4 text-gray-400">Session Locked</p>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                   className="p-2 rounded bg-gray-800 border border-gray-700 mb-2" placeholder="Password (demo)"
                   onKeyDown={e => { if (e.key === 'Enter') onUnlock(); }}
            />
            <button onClick={onUnlock} className="bg-blue-600 px-4 py-2 rounded">Unlock</button>
        </div>
    );
};

export const DesktopView: React.FC<{ onNavigate: (view: ViewType, props?: any) => void; }> = ({ onNavigate }) => {
    const { config: systemConfig, theme: themeService, virtualDesktops: virtualDesktopService, auth: authenticationService, telemetry: telemetryService } = useSystemServices();
    
    const [windows, setWindows] = useState<Record<string, WindowState>>({});
    const [activeId, setActiveId] = useState<string | null>(null);
    const [nextZIndex, setNextZIndex] = useState(Z_INDEX_BASE);
    const [activeTheme, setActiveTheme] = useState(themeService.getCurrentTheme());
    const [activeDesktopId, setActiveDesktopId] = useState(virtualDesktopService.getActiveDesktopId());
    const [showSearchOverlay, setShowSearchOverlay] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [isLocked, setIsLocked] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

    // Subscriptions
    useEffect(() => systemConfig.subscribe(() => {}), [systemConfig]);
    useEffect(() => themeService.subscribe(setActiveTheme), [themeService]);
    useEffect(() => virtualDesktopService.subscribe(() => setActiveDesktopId(virtualDesktopService.getActiveDesktopId())), [virtualDesktopService]);
    useEffect(() => {
        authenticationService.getCurrentUser().then(u => {
            setCurrentUser(u);
            if (!u) setIsLocked(true);
        });
        return authenticationService.subscribeAuthChange(u => {
            setCurrentUser(u);
            if (!u) { setIsLocked(true); setWindows({}); }
        });
    }, [authenticationService]);

    // Window Management
    const openWindow = useCallback((featureId: string) => {
        setNextZIndex(prev => prev + 1);
        setActiveId(featureId);
        setWindows(prev => {
            if (prev[featureId]) {
                return { ...prev, [featureId]: { ...prev[featureId], isMinimized: false, zIndex: nextZIndex + 1, desktopId: activeDesktopId } };
            }
            return {
                ...prev,
                [featureId]: {
                    id: featureId,
                    position: { x: 50 + (Object.keys(prev).length * 20), y: 50 + (Object.keys(prev).length * 20) },
                    size: { width: 800, height: 600 },
                    zIndex: nextZIndex + 1,
                    isMinimized: false,
                    isMaximized: false,
                    isResizing: false,
                    isDragging: false,
                    desktopId: activeDesktopId,
                    opacity: 1
                }
            };
        });
    }, [nextZIndex, activeDesktopId]);

    const closeWindow = useCallback((id: string) => {
        setWindows(prev => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });
    }, []);

    const updateWindowState = useCallback((id: string, updates: any) => {
        setWindows(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }));
    }, []);

    const featuresMap = useMemo(() => new Map(ALL_FEATURES.map(f => [f.id, f])), []);

    const handleDesktopRightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    if (isLocked) return <ScreenLocker onUnlock={() => setIsLocked(false)} />;

    return (
        <div 
            className="h-full w-full relative overflow-hidden transition-colors duration-500 bg-cover bg-center"
            style={{ 
                backgroundImage: `url(${virtualDesktopService.getDesktops().find((d: VirtualDesktop) => d.id === activeDesktopId)?.wallpaperUrl})`,
                '--primary-color': activeTheme.primaryColor 
            } as any}
            onContextMenu={handleDesktopRightClick}
            onClick={() => setContextMenu(null)}
        >
             <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                {virtualDesktopService.getDesktops().find((d: VirtualDesktop) => d.id === activeDesktopId)?.name}
            </div>

            <FeatureDock onOpen={openWindow} />

            {(Object.values(windows) as WindowState[]).filter(w => !w.isMinimized && w.desktopId === activeDesktopId).map(win => {
                const feat = featuresMap.get(win.id);
                if (!feat) return null;
                return (
                    <Window 
                        key={win.id} 
                        feature={feat} 
                        state={win} 
                        isActive={activeId === win.id}
                        onClose={() => closeWindow(win.id)}
                        onMinimize={() => setWindows(p => ({...p, [win.id]: {...p[win.id], isMinimized: true}}))}
                        onMaximize={() => setWindows(p => ({...p, [win.id]: {...p[win.id], isMaximized: !p[win.id].isMaximized, size: !p[win.id].isMaximized ? { width: window.innerWidth, height: window.innerHeight - 60 } : { width: 800, height: 600 }, position: !p[win.id].isMaximized ? {x:0, y:0} : {x:50, y:50} }}))}
                        onFocus={() => { setActiveId(win.id); setWindows(p => ({...p, [win.id]: {...p[win.id], zIndex: nextZIndex + 1}})); setNextZIndex(z => z + 1); }}
                        onUpdate={updateWindowState}
                        telemetryService={telemetryService}
                    />
                );
            })}

            <SystemNotificationDisplay />
            <SystemStatusMonitor />
            
            <Taskbar 
                minimizedWindows={(Object.values(windows) as WindowState[]).filter(w => w.isMinimized).map(w => featuresMap.get(w.id)!)}
                openWindows={(Object.values(windows) as WindowState[]).filter(w => w.desktopId === activeDesktopId).map(w => featuresMap.get(w.id)!)}
                onRestore={openWindow}
                onOpenSearch={() => setShowSearchOverlay(true)}
                onSwitchDesktop={id => virtualDesktopService.setActiveDesktop(id)}
                activeDesktopId={activeDesktopId}
                allDesktops={virtualDesktopService.getDesktops()}
                onLogout={() => authenticationService.logout()}
            />

            <SystemSearchOverlay isOpen={showSearchOverlay} onClose={() => setShowSearchOverlay(false)} />
            
            <DesktopContextMenu 
                position={contextMenu} 
                onClose={() => setContextMenu(null)}
                onOpenFeature={openWindow}
                onSwitchTheme={id => themeService.applyTheme(id)}
                onLogout={() => authenticationService.logout()}
            />
            
            <ActionManager />
        </div>
    );
};