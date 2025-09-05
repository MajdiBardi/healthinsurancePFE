// Gestionnaire de notifications offline
class NotificationManager {
  constructor() {
    this.storageKey = 'clientNotifications';
  }

  // Ajouter une notification
  addNotification(notification) {
    const notifications = this.getAllNotifications();
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    notifications.unshift(newNotification);
    this.saveNotifications(notifications);
    
    console.log('Notification added:', newNotification);
    return newNotification;
  }

  // Récupérer toutes les notifications
  getAllNotifications() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  // Marquer une notification comme lue
  markAsRead(notificationId) {
    const notifications = this.getAllNotifications();
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.saveNotifications(updated);
  }

  // Supprimer une notification
  deleteNotification(notificationId) {
    const notifications = this.getAllNotifications();
    const updated = notifications.filter(n => n.id !== notificationId);
    this.saveNotifications(updated);
  }

  // Compter les notifications non lues
  getUnreadCount() {
    const notifications = this.getAllNotifications();
    return notifications.filter(n => !n.read).length;
  }

  // Sauvegarder les notifications
  saveNotifications(notifications) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  // Nettoyer les anciennes notifications (plus de 30 jours)
  cleanup() {
    const notifications = this.getAllNotifications();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recent = notifications.filter(n => 
      new Date(n.timestamp) > thirtyDaysAgo
    );
    
    if (recent.length !== notifications.length) {
      this.saveNotifications(recent);
      console.log(`Cleaned up ${notifications.length - recent.length} old notifications`);
    }
  }
}

// Instance singleton
export const notificationManager = new NotificationManager();

// Nettoyer automatiquement au démarrage
notificationManager.cleanup();
