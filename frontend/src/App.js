import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";

import {
  Container,
  Typography,
  TextField,
  Snackbar,
  Alert,
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  Autocomplete,
  Skeleton,
  Checkbox,
  Avatar,
  Collapse
} from "@mui/material";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import GitHubIcon from "@mui/icons-material/GitHub";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import SyncIcon from "@mui/icons-material/Sync";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CheckIcon from "@mui/icons-material/Check";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import List from "@mui/material/List";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import RefreshIcon from "@mui/icons-material/Refresh";


const API_URL = process.env.REACT_APP_API_URL;
const ENV_OPTIONS = ["prod", "alpha", "devCloud", "staging"];

const deleteBranchApi = async (branchName) => {
  try {
    const res = await fetch(`${API_URL}/delete-branch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branch: branchName }),
    });

    // If server returns a non-200 response, throw
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || res.statusText || "Delete failed");
    }

    // Try parse as JSON
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error deleting branch:", err);
    return {
      success: false,
      error: err.message || "Unknown error occurred while deleting branch",
    };
  }
};
const branchTypeColors = {
  aclp: "#2563eb",      // blue (used for 'aclp')
  ankita: "#facc15",    // yellow (used for 'ankita')
  linode: "#16a34a",    // green (used for 'linode')
  nikil: "#64748b",     // gray (nikil)
  origin: "#dc2626",    // red (used for 'origin')
  santosh: "#a21caf",   // purple (santosh)
  venky: "#0ea5e9",     // cyan (venky)
  default: "#dc2626"    // fallback gray
};

function stringToColor(string) {
  let hash = 0;
  let i;
  for (i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).slice(-2);
  }
  return color;
}

const getCurrentBranchApi = async () => {
  const res = await fetch(`${API_URL}/current-branch`);
  if (!res.ok) throw new Error("Failed to get current branch");
  return res.json();
};

const stashChangesApi = async () => {
  const res = await fetch(`${API_URL}/stash`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
};

const CloudPulseLogo = () => (
  <svg
    width="32"
    height="35"
    viewBox="0 0 100 108"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g fill="#009CDE" fillRule="nonzero">
      <path d="M54.5,104.8 C57,105.6 56.9,107.2 54.1,107.2 C24.3,107.2 0,83.2 0,53.6 C0,24 24.2,0 54.1,0 C56.9,0 57.5,1.5 55.2,2.2 C32.8,8.6 16.4,29.2 16.4,53.6 C16.4,77.7 32.4,98.1 54.5,104.8 M26.6,66.1 C26.5,64.7 26.4,63.2 26.4,61.7 C26.4,38.2 45.5,19.1 69,19.1 C91.2,19.1 97.9,29 98.7,28.4 C99.6,27.7 90.6,8 64.5,8 C41,8 21.9,27.1 21.9,50.6 C21.9,56 22.9,61.2 24.8,66 C25.6,68 26.8,68.1 26.6,66.1 M44.5,35.4 C55.6,30.6 69.5,30.4 83.1,35.2 C92.3,38.4 97.6,43 98,42.8 C98.7,42.5 92.7,32.9 81.7,28.7 C68.4,23.7 54.2,26.3 43.8,34.5 C42.7,35.4 43.1,36 44.5,35.4" />
    </g>
  </svg>
);

const ENV_LABELS = {
  prod: "Production",
  alpha: "Alpha",
  staging: "Staging",
  devCloud: "Dev Cloud",
};

function App() {
  const [removeRemoteDialogOpen, setRemoveRemoteDialogOpen] = useState(false);
  
const [selectedRemote, setSelectedRemote] = useState("");

  const [menuAnchorEl, setMenuAnchorEl] = useState(null); // For popover anchor
  const [menuBranch, setMenuBranch] = useState(null);
  const [envSwitcherOpen, setEnvSwitcherOpen] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState("");
  const [envLoading, setEnvLoading] = useState(false);
  const [envMessage, setEnvMessage] = useState("");

  // At top of App.js
  const [addRemoteDialogOpen, setAddRemoteDialogOpen] = useState(false);
  const [newRemoteName, setNewRemoteName] = useState("");
  const [newRemoteUrl, setNewRemoteUrl] = useState("");
  const [isAddingRemote, setIsAddingRemote] = useState(false);

  const [remotes, setRemotes] = useState([]);
  // State for branches, selection, search and loading
  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [deletingBranches, setDeletingBranches] = useState(new Set());
  const [pendingCompareBranch, setPendingCompareBranch] = React.useState(null);
  const [runOutput, setRunOutput] = useState('');
  const [runError, setRunError] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const [outputOpen, setOutputOpen] = useState(false);
  const [serverOutput, setServerOutput] = useState('');
  const [serverError, setServerError] = useState('');
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [serverOutputOpen, setServerOutputOpen] = useState(true);
  
  

  // Instead of opening and closing in same event tick:

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuBranch(null);
  };

  // Effect to open dialog after menu closes and pending branch is set
  React.useEffect(() => {
    if (!menuAnchorEl && pendingCompareBranch) {
      setSnackbar((prev) => ({ ...prev, open: false })); // close snackbar!
      setBaseBranch(pendingCompareBranch);
      setCompareBranch("");
      setCompareDialogOpen(true);
      setCompareResult(null);
      setCompareLoading(false);
      setPendingCompareBranch(null);
    }
  }, [menuAnchorEl, pendingCompareBranch]);

  // Delete confirmations
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    branchName: "",
  });


  // Current branch display
  const [currentBranch, setCurrentBranch] = useState("");

  // Stash loading
  const [isStashing, setIsStashing] = useState(false);

  // Pull loading & force pull confirm
  const [isPulling, setIsPulling] = useState(false);
  const [forcePullConfirmOpen, setForcePullConfirmOpen] = useState(false);

  // Automation dialog
  const [automationDialogOpen, setAutomationDialogOpen] = useState(false);
  // Create Branch dialog and form state
  const [createBranchDialogOpen, setCreateBranchDialogOpen] = useState(false);
  const [createBranchRemote, setCreateBranchRemote] = useState("");
  const [createBranchTarget, setCreateBranchTarget] = useState("");
  const [createBranchName, setCreateBranchName] = useState("");
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [remoteBranchList, setRemoteBranchList] = useState([]);
  const [remoteBranchesLoading, setRemoteBranchesLoading] = useState(false);

  // Checkout Branch dialog
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [checkoutBranchName, setCheckoutBranchName] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Stats dialog state and data
  const [statsOpen, setStatsOpen] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsData, setStatsData] = useState([]);
  const [statsError, setStatsError] = useState("");
  const [statsBranch, setStatsBranch] = useState("");

  // Suggestions cache and abort
  const [suggestions, setSuggestions] = useState([]);
  const suggestionsCacheRef = useRef({});
  const abortControllerRef = useRef(null);
  const [specList, setSpecList] = useState([]);
  const [checkedSpecs, setCheckedSpecs] = useState([]);
  const [specLoading, setSpecLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [lastEnvKey, setLastEnvKey] = useState(
    () => localStorage.getItem("lastEnvKey") || "",
  );
  const [pageSize, setPageSize] = useState(10); // Default page size
  const [branchLogDialogOpen, setBranchLogDialogOpen] = useState(false);
  const [branchLogLoading, setBranchLogLoading] = useState(false);
  const [branchLogList, setBranchLogList] = useState([]);
  const [branchLogError, setBranchLogError] = useState("");
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [baseBranch, setBaseBranch] = useState("");
  const [compareBranch, setCompareBranch] = useState("");
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareResult, setCompareResult] = useState(null);

  const [isOpeningCreateDialog, setIsOpeningCreateDialog] = useState(false);
  const [showChangeset, setShowChangeset] = useState(false);
  const [runDialogOpen, setRunDialogOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // or "error", "info", "warning"
  });

  const normalizeBranch = (row, idx) => ({
    ...row,
    id: row.name || idx,
    name: row.name ?? "",
    date: row.date ?? "",
    createdAt: row.createdAt ?? row.createdat ?? "",
    createdFrom: row.createdFrom ?? row["created from"] ?? "",
  });
  // Handle branch selection changes
  const handleCompareBranches = async () => {
    setCompareLoading(true);
    setCompareResult(null);
    setSnackbar({ open: false, message: "", severity: "info" }); // if you want to close old notifications
    try {
      const resp = await fetch(
        `${API_URL}/compare-branches?base=${encodeURIComponent(baseBranch)}&compare=${encodeURIComponent(compareBranch)}`,
      );
      const data = await resp.json();
      if (data.success) {
        setCompareResult(data);
        setSnackbar({
          open: true,
          message: "Comparison successful.",
          severity: "success",
        });
      } else {
        setCompareResult({ error: data.error || "Unknown error" });
        setSnackbar({
          open: true,
          message: data.error || "Comparison failed.",
          severity: "error",
        });
      }
    } catch (e) {
      setCompareResult({ error: String(e.message) });
      setSnackbar({
        open: true,
        message: String(e.message),
        severity: "error",
      });
    }
    setCompareLoading(false);
  };

  const handleOpenMenu = (event, branchName) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuBranch(branchName);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuBranch(null);
  };

  const handleOpenRemoveRemote = async () => {
    try {
      const res = await fetch(`${API_URL}/remotes`);
      const data = await res.json();
      setRemotes(data.remotes || []);
      setSelectedRemote(data.remotes && data.remotes[0] ? data.remotes : "");
      setRemoveRemoteDialogOpen(true);
    } catch (e) {
      // Handle error (optional: showSnackbar)
      setRemotes([]);
      setSelectedRemote("");
      setRemoveRemoteDialogOpen(true);
    }
  };

  // Debounce utility
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // Fetch suggestions for autocomplete with abort & cache
  const fetchSuggestions = async (input) => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }
    if (suggestionsCacheRef.current[input]) {
      setSuggestions(suggestionsCacheRef.current[input]);
      return;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    try {
      const res = await fetch(
        `${API_URL}/search-branches?q=${encodeURIComponent(input.trim())}`,
        { signal: abortControllerRef.current.signal },
      );
      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data.results)
          ? data.results
          : Array.isArray(data)
            ? data
            : [];
        const names = results.map((b) => b.name || "");
        suggestionsCacheRef.current[input] = names;
        setSuggestions(names);
      } else {
        setSuggestions([]);
      }
    } catch (e) {
      if (e.name === "AbortError") return;
      setSuggestions([]);
    }
  };

  const addRemoteApi = async (remote, url) => {
    const response = await fetch(`${API_URL}/add-remote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remote, url }),
    });
    return await response.json();
  };

  const SuggestionPaper = React.forwardRef(
    function SuggestionPaper(props, ref) {
      const { children, branchCount, ...other } = props;
      return (
        <Paper
          ref={ref}
          sx={{
            width: "100%",
            minWidth: 0,
            borderRadius: 3,
            border: "2.5px solid #bae6fd",
            mt: 0.2,
            bgcolor: "#f8fafc",
            boxShadow: "0 8px 36px -8px #bae6fd90",
            overflow: "hidden",
          }}
          {...other}
        >
          <List disablePadding>{children}</List>
          <Box
            sx={{
              px: 2,
              py: 1,
              borderTop: "1px solid #bae6fd",
              fontSize: 13.5,
              color: "#0284c7",
              fontWeight: 500,
              bgcolor: "#f8fafc",
              textAlign: "right",
            }}
          >
            {branchCount} {branchCount === 1 ? "branch" : "branches"} found
          </Box>
        </Paper>
      );
    },
  );

  // Compute filtered suggestions based on current input
  const filteredSuggestions = suggestions.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase()),
  );

  // Debounced fetching for suggestions
  const debouncedFetchSuggestions = useMemo(
    () => debounce(fetchSuggestions, 400),
    [],
  );

  useEffect(() => {
    document.title = "Git Dashboard";
  }, []);

  useEffect(() => {
    debouncedFetchSuggestions(search);
  }, [search, debouncedFetchSuggestions]);

  useEffect(() => {
    if (automationDialogOpen) {
      setSpecLoading(true);
      fetch(`${API_URL}/list-specs`)
        .then((res) => res.json())
        .then((data) => {
          setSpecList(Array.isArray(data) ? data : []);
          setCheckedSpecs([]);
          setSelectAll(false);
        })
        .catch(() => {
          setSpecList([]);
          setCheckedSpecs([]);
          setSelectAll(false);
        })
        .finally(() => setSpecLoading(false));
    }
  }, [automationDialogOpen]);

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/remotes`)
      .then((res) => res.json())
      .then((data) => {
        if (active && data.remotes) setRemotes(data.remotes);
      })
      .catch((e) => {
        setRemotes([]);
        console.error("Error fetching remotes:", e);
      });
    return () => {
      active = false;
    };
  }, []);

  const fetchRemotes = useCallback(() => {
    let active = true;
    fetch(`${API_URL}/remotes`)
      .then((res) => res.json())
      .then((data) => {
        if (active && data.remotes) setRemotes(data.remotes);
      })
      .catch(() => setRemotes([]));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const cleanup = fetchRemotes();
    return cleanup;
  }, [fetchRemotes]);

  // Fetch branches list
  useEffect(() => {
    let active = true;
    const url = query
      ? `${API_URL}/search-branches?q=${encodeURIComponent(query)}`
      : `${API_URL}/branches`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        // For `/search-branches`, data is { results: [...] }
        // For `/branches`, data could be an array or have similar structure
        let rows = [];
        if (Array.isArray(data?.results)) {
          rows = data.results;
        } else if (Array.isArray(data)) {
          rows = data;
        } else {
          rows = [];
        }
        setBranches(rows.map((row, idx) => normalizeBranch(row, idx)));
      })
      .catch(() => {
        if (!active) return;
        setSnackbar({
          open: true,
          message: "Failed to fetch branches.",
          severity: "error",
        });
      });
    return () => {
      active = false;
    };
  }, [query]); // include API_URL if it can change

  // Fetch current branch initially
  useEffect(() => {
    let active = true;
    getCurrentBranchApi()
      .then((data) => {
        if (active && data.branch) setCurrentBranch(data.branch);
      })
      .catch((e) => console.error("Failed to fetch current branch", e));
    return () => {
      active = false;
    };
  }, []);

  // Fetch remote branches for create branch form
  useEffect(() => {
    if (
      !createBranchRemote ||
      ["aclp", "linode"].includes(createBranchRemote)
    ) {
      setRemoteBranchList([]);
      return;
    }
    setRemoteBranchesLoading(true);
    fetch(`${API_URL}/remotes?remote=${encodeURIComponent(createBranchRemote)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setRemoteBranchList)
      .catch(() => setRemoteBranchList([]))
      .finally(() => setRemoteBranchesLoading(false));
  }, [createBranchRemote]);

  const handleOpenEnvSwitcher = () => {
    setEnvMessage("");
    //setSelectedEnv('');
    setEnvSwitcherOpen(true);
  };

  const handleCloseEnvSwitcher = () => {
    setEnvSwitcherOpen(false);
    setEnvMessage("");
    setSelectedEnv("");
  };

  const handleConfirmEnvSwitch = async () => {
    if (!selectedEnv || !ENV_OPTIONS.includes(selectedEnv)) {
      setEnvMessage("Please select a valid environment.");
      return;
    }
    setEnvLoading(true);
    setEnvMessage("");
    try {
      const resp = await fetch(`${API_URL}/env?env=${selectedEnv}`);
      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || resp.statusText || "Switch failed");
      }

      setEnvMessage(`Switched to: ${data.envKey || selectedEnv}`);
      setLastEnvKey(data.envKey || selectedEnv); // <--- ADD HERE
      localStorage.setItem("lastEnvKey", data.envKey || selectedEnv); // <--- ADD HERE
      setEnvSwitcherOpen(false);
    } catch (e) {
      setEnvMessage(`Failed: ${e.message}`);
    } finally {
      setEnvLoading(false);
    }
  };

  const handleCopyCommit = (commitId) => {
    navigator.clipboard.writeText(commitId);
    setSnackbar({
      open: true,
      message: `Copied commit id: ${commitId}`,
      severity: "success",
    });
  };

  // Confirm single branch delete
  const handleConfirmDelete = async () => {
    const branchName = confirmDelete.branchName;
    setDeletingBranches((prev) => new Set(prev).add(branchName)); // disables button during work
    try {
      const result = await deleteBranchApi(branchName);
      if (result.success) {
        setSnackbar({
          open: true,
          message: `Branch "${branchName}" deleted.`,
          severity: "success",
        });
        setBranches((prev) => prev.filter((b) => b.name !== branchName));
        setConfirmDelete({ open: false, branchName: "" });
      } else {
        setSnackbar({
          open: true,
          message: result.error || "Delete failed.",
          severity: "error",
        });
      }
    } catch (e) {
      setSnackbar({
        open: true,
        message: String(e.message),
        severity: "error",
      });
    }
    setDeletingBranches((prev) => {
      const newSet = new Set(prev);
      newSet.delete(branchName);
      return newSet;
    });
  };

  // Stash handler
  const handleStashChanges = async () => {
    setIsStashing(true);
    setSnackbar({ open: false, message: "", severity: "info" });
    try {
      const data = await stashChangesApi();
      if (data.success) {
        setSnackbar({
          open: true,
          message: data.message ?? "Stash successful.",
          severity: "success",
        });
        if (data.branch) setCurrentBranch(data.branch);
      } else {
        setSnackbar({
          open: true,
          message: data.message ?? "Stash failed.",
          severity: "error",
        });
      }
    } catch (e) {
      setSnackbar({
        open: true,
        message: String(e.message),
        severity: "error",
      });
    }
    setIsStashing(false);
  };
  // Pull with force option
  const handlePull = async () => {
    setIsPulling(true);
    setSnackbar({ open: false, message: "", severity: "info" });
    try {
      const resp = await fetch(`${API_URL}/pull-and-pnpm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await resp.json();
      if (
        !resp.ok &&
        data.error &&
        data.error.includes("uncommitted changes")
      ) {
        setForcePullConfirmOpen(true);
      } else if (!resp.ok) {
        setSnackbar({
          open: true,
          message: data.error || "Pull failed",
          severity: "error",
        });
      } else {
        setSnackbar({ open: true, message: data.message, severity: "success" });
        setQuery(""); // Refresh branches
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: String(err.message),
        severity: "error",
      });
    }
    setIsPulling(false);
  };
  // Force pull ignoring uncommitted changes
  const forcePull = async () => {
    setForcePullConfirmOpen(false);
    setIsPulling(true);
    try {
      const resp = await fetch(`${API_URL}/pull-and-pnpm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setSnackbar({
          open: true,
          message: data.error || "Pull failed",
          severity: "error",
        });
      } else {
        setSnackbar({ open: true, message: data.message, severity: "success" });
        setQuery(""); // Refresh branches
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: String(err.message),
        severity: "error",
      });
    }
    setIsPulling(false);
  };

  //start service
  const handleStartService = async () => {
    setIsServerRunning(true);
    setServerOutput('');
    setServerError('');
    try {
      const resp = await fetch(`${API_URL}/start-service`);
      const data = await resp.json();
      if (data.success) {
        setServerOutput(data.output || data.message || 'Service started.');
        setServerError('');
      } else {
        setServerOutput('');
        setServerError(data.error || 'Failed to start service.');
      }
    } catch {
      setServerOutput('');
      setServerError('Failed to start service.');
    } finally {
      setIsServerRunning(false);
    }
  };
  
  

  const handleShowBranchLog = async () => {
    setBranchLogDialogOpen(true);
    setBranchLogLoading(true);
    setBranchLogError("");
    setBranchLogList([]);
    try {
      const res = await fetch(`${API_URL}/getlog`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();
      if (result.success) {
        setBranchLogList(Array.isArray(result.commits) ? result.commits : []);
      } else {
        setBranchLogError("Failed to fetch commit log");
      }
    } catch (err) {
      setBranchLogError("Failed to fetch commit log: " + err.message);
    }
    setBranchLogLoading(false);
  };

  //add remote handler

  const handleAddRemote = async () => {
    setIsAddingRemote(true);
    setSnackbar({ open: false, message: "", severity: "info" });
    try {
      const data = await addRemoteApi(newRemoteName, newRemoteUrl); // use your input state
      if (data.success) {
        setSnackbar({
          open: true,
          message: data.message ?? "Remote added successfully.",
          severity: "success",
        });
        setAddRemoteDialogOpen(false);
        setNewRemoteName("");
        setNewRemoteUrl("");
        await fetchRemotes(); // Refresh the remotes list to update UI immediately
      } else {
        setSnackbar({
          open: true,
          message: data.error ?? "Failed to add remote.",
          severity: "error",
        });
      }
    } catch (e) {
      setSnackbar({
        open: true,
        message: String(e.message),
        severity: "error",
      });
    }
    setIsAddingRemote(false);
  };

  const FloatingWhiteTooltip = styled(({ className, ...props }) => (
    <Tooltip
      {...props}
      arrow
      placement="top"
      classes={{ tooltip: className }}  // <-- FIXED HERE!!
    />
  ))(() => ({
    [`&.${tooltipClasses.tooltip}`]: {  // <-- FIXED SELECTOR!
      background: "#fff",
      color: "#0ea5e9",
      border: "1.5px solid #bae6fd",
      fontWeight: 600,
      fontSize: 15,
      borderRadius: 9,
      boxShadow: "0 4px 14px 2px #bae6fd26",
      padding: "7px 16px",
      marginBottom: "7px",
    },
    [`& .${tooltipClasses.arrow}`]: {
      color: "#fff",
      filter: "drop-shadow(0 2px 7px #bae6fd55)",
    },
  }));
 
 
  // Create new branch handler
  const handleCreateBranch = async () => {
    setIsSubmittingCreate(true);
    try {
      const resp = await fetch(`${API_URL}/create-branch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          remoteRepo: createBranchRemote,
          targetBranch: createBranchTarget,
          branchName: createBranchName,
        }),
      });
      const data = await resp.json();

      if (resp.ok && data.success) {
        setSnackbar({
          open: true,
          message: `Branch created: ${data.branch}`,
          severity: "success",
        });
        setCreateBranchDialogOpen(false);

        // Explicitly fetch updated branches from ${API_URL}/branches:
        const branchesResp = await fetch(`${API_URL}/branches`);
        if (branchesResp.ok) {
          const branchesData = await branchesResp.json();
          setBranches(
            (branchesData || []).map((row, idx) => normalizeBranch(row, idx)),
          );
        } else {
          setSnackbar({
            open: true,
            message: "Failed to refresh branches after creation.",
            severity: "error",
          });
        }

        // 🔄 Refresh current branch after creation
        try {
          const current = await getCurrentBranchApi();
          if (current.branch) setCurrentBranch(current.branch);
        } catch (err) {
          console.error(
            "Failed to refresh current branch after creation:",
            err,
          );
        }
      } else {
        throw new Error(data.error || "Failed to create branch");
      }
    } catch (e) {
      setSnackbar({
        open: true,
        message: String(e.message),
        severity: "error",
      });
    }
    setIsSubmittingCreate(false);
  };

  // Checkout branch handler
  const handleCheckoutBranch = async () => {
    if (!checkoutBranchName.trim()) return;

    setIsCheckingOut(true);

    try {
      const resp = await fetch(`${API_URL}/checkout-branch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch: checkoutBranchName.trim() }),
      });

      const data = await resp.json();

      if (!resp.ok || !data.success) {
        throw new Error(data.error || "Checkout failed");
      }

      // Success Snackbar & Refresh current branch info
      setSnackbar({ open: true, message: data.message, severity: "success" });

      const current = await getCurrentBranchApi();
      if (current.branch) setCurrentBranch(current.branch);

      // Don't close dialog here, delay closing after spinner off
    } catch (error) {
      setSnackbar({ open: true, message: String(error), severity: "error" });
    } finally {
      setIsCheckingOut(false); // Stop spinner first

      // Delay dialog close slightly to allow spinner render
      setTimeout(() => {
        setCheckoutDialogOpen(false);
      }, 400);
    }
  };

  const AppButton = ({
    children,
    onClick,
    disabled = false,
    startIcon = null,
    loading = false,
    color = "primary",
    variant = "contained",
    size = "size",
    sx = {},
  }) => {
    const icon = loading ? (
      <CircularProgress color="inherit" size={18} />
    ) : (
      startIcon
    );

    return (
      <Button
        variant={variant}
        size={size}
        disabled={disabled || loading}
        onClick={onClick}
        startIcon={icon}
        color={color}
        sx={{
          textTransform: "none",
          fontWeight: 500,
          fontSize: 13,
          borderRadius: 2,
          px: 1.1, // Padding left and right – controls button padding, not width
          py: 1.2, // Padding top/bottom
          background: "linear-gradient(90deg, #0ea5e9 90%, #38bdf8 110%)",
          color: "#fff",
          boxShadow: "0 2px 8px #0ea5e950",
          "&:hover": {
            background: "linear-gradient(90deg, #0ea5e9 90%, #38bdf8 110%)",
            border: "2px solid #0ea5e9",
          },
          ...sx,
        }}
      >
        {loading ? `${children}ing...` : children}
      </Button>
    );
  };

  const handleDeleteRemote = async () => {
    if (!selectedRemote) return;
    try {
      const response = await fetch(
        `${API_URL}/remove-remote/${selectedRemote}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove remote");
      }
      setRemotes(remotes.filter((r) => r !== selectedRemote));
      setSelectedRemote("");
      setRemoveRemoteDialogOpen(false);

      // Use consolidated snackbar state update
      setSnackbar({
        open: true,
        message: `Remote '${selectedRemote}' removed successfully.`,
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to remove remote: ${error.message}`,
        severity: "error",
      });
    }
  };

  const handleCheckout = async (branchName) => {
    try {
      // Call your API or function to checkout
      await fetch(`${API_URL}/checkout-branch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch: branchName }),
      });
      setSnackbar({
        open: true,
        message: `Checked out "${branchName}"!`,
        severity: "success",
      });
      setCurrentBranch(branchName);
    } catch (e) {
      setSnackbar({
        open: true,
        message: `Failed to checkout "${branchName}"`,
        severity: "error",
      });
    }
  };
  const handleRunSpecs = async (specPaths) => {
    setIsRunning(true);
    setRunOutput(''); // <-- clear previous output immediately
    setRunError('');
    try {
      const resp = await fetch(`${API_URL}/run-automation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specPaths }),
      });
      const data = await resp.json();
  
      // Append all new output, or error if present
      if (data.output) setRunOutput(prev => prev + data.output);
      if (data.error) setRunError(prev => prev + data.error);
    } catch (e) {
      setRunError(prev => prev + (e.message || 'Error running specs'));
    }
    setIsRunning(false);
  };
  

  const handleDelete = (branchName) => {
    // You can still use your confirmation dialog if needed!
    setConfirmDelete({ open: true, branchName });
  };

  // Function to show stats dialog by calling stats API
  const handleShowStats = async (branchName) => {
    setStatsOpen(true);
    setStatsLoading(true);
    setStatsError("");
    setStatsData([]);
    setStatsBranch(branchName);
    try {
      const res = await fetch(
        `${API_URL}/ts-file-stats?branch=${encodeURIComponent(branchName)}`,
      );
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setStatsError("No stats are available.");
        setStatsData([]);
      } else {
        setStatsData(data);
        setStatsError("");
      }
    } catch {
      setStatsError("Failed to fetch stats.");
      setStatsData([]);
    }
    setStatsLoading(false);
  };

  // Loading skeleton for table
  const LoadingOverlay = () => (
    <Box sx={{ p: 2, position: "sticky" }}>
      {[...Array(5)].map((_, i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height={40}
          sx={{ mb: 1, borderRadius: 1 }}
          animation="wave"
        />
      ))}
    </Box>
  );

  const columns = [
    {
      field: "bugTicket",
      headerName: "BugTicket",
      minWidth: 170,
      flex: 0.9,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 1 }}>
          <img
            src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/jira.svg"
            style={{ width: 19, height: 19, color: "#0ea5e9" }}
            alt="Jira"
          />
          <span style={{ fontWeight: 700, color: "#2563eb" }}>BugTicket</span>
        </Box>
      ),
      renderCell: (params) =>
        params.value && params.value.startsWith("DI-") ? (
          <FloatingWhiteTooltip
            title="Tracking the requirements using the linked JIRA ticket."
            arrow
            componentsProps={{ tooltip: { sx: { marginBottom: "6px" } } }}
          >
            <Chip
              label={params.value}
              component="a"
              href={`https://track.akamai.com/jira/browse/${params.value}`}
              target="_blank"
              clickable
              sx={{
                maxWidth: 170,
                minWidth: 68,
                height: 36,
                fontWeight: 600,
                fontSize: 15,
                color: "#2563eb",
                bgcolor: "#e0f2fe",
                border: "2px solid #38bdf8",
                borderRadius: "18px",
                boxShadow: "0 2px 8px #bae6fd22",
                px: 2,
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                cursor: "pointer",
                transition: "all .14s",
                "&:hover": {
                  bgcolor: "#bae6fd",
                  color: "#2563eb",
                  borderColor: "#2563eb",
                  boxShadow: "0 4px 16px #38bdf84a",
                },
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  px: 0,
                },
              }}
            />
          </FloatingWhiteTooltip>
        ) : (
          <Chip
            label="No ticket"
            sx={{
              maxWidth: 120,
              minWidth: 68,
              height: 36,
              fontWeight: 600,
              fontSize: 15,
              color: "#525252",
              bgcolor: "#f3f4f6",
              border: "2px dashed #d1d5db",
              borderRadius: "18px",
              boxShadow: "0 2px 8px #e5e7eb10",
              px: 2,
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          />
        ),
    },

    {
      field: "name",
      headerName: "Branch Name",
      minWidth: 240,
      flex: 1.2,
      renderHeader: () => <strong>Branch Name</strong>,
      renderCell: (params) => {
      
        const branchName = (params.value || "").toLowerCase();
        // Find the FIRST matching remote whose name is contained anywhere in the branch name
        const foundRemote =
          remotes.find(remote => branchName.includes(remote)) || "default";
        const color = branchTypeColors[foundRemote] || branchTypeColors.default;
          return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              maxWidth: 285,
              cursor: "pointer",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
            onClick={() => handleShowStats(params.value)}
            title={params.value}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: color,
                mr: 1,
                flexShrink: 0,
              }}
            />
            <Typography noWrap sx={{ fontWeight: 600, color: "#2563eb", userSelect: "text" }}>
              {params.value}
            </Typography>
          </Box>
        );
      },
    },
    
    {
      field: "date",
      headerName: "Branch Creation Date",
      minWidth: 230,
      flex: 1,
      renderHeader: () => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            pl: 1,
            position: "sticky",
          }}
        >
          <span style={{ fontWeight: 700 }}>Creation Date</span>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ pl: 1, position: "sticky" }}>
          <span style={{ color: "#2d3748", fontWeight: 500 }}>
            {params.value || "-"}
          </span>
        </Box>
      ),
    },
    {
      field: "createdFrom",
      headerName: "Created From",
      minWidth: 230,
      flex: 1,
      renderHeader: () => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            pl: 1,
            position: "sticky",
          }}
        >
          <span style={{ fontWeight: 700 }}>Created From</span>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ pl: 1, position: "sticky" }}>
          <span style={{ color: "#2d3748", fontWeight: 600 }}>
            {params.value || "-"}
          </span>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions", // MUST be a string!
      renderHeader: () => (
        <FloatingWhiteTooltip title="Use the actions menu to Checkout or Delete a branch.">
          <span
            style={{
              display: "flex",
              alignItems: "center",
              fontWeight: 700,
            }}
          >
            Actions
          </span>
        </FloatingWhiteTooltip>
      ),
      width: 100,
      minWidth: 100,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => handleOpenMenu(e, params.row.name)}
            aria-label="actions"
          >
            <MoreVertIcon />
          </IconButton>
          {menuBranch === params.row.name && (
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem
                onClick={() => {
                  handleCheckout(params.row.name);
                  handleCloseMenu();
                }}
                disabled={currentBranch === params.row.name}
                sx={{ minWidth: 120 }}
              >
                <CheckIcon fontSize="small" sx={{ mr: 1 }} />
                Checkout
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleDelete(params.row.name);
                  handleCloseMenu();
                }}
                sx={{ color: "error.main", minWidth: 120 }}
              >
                <DeleteIcon
                  sx={{ color: "error.main", mr: 1 }}
                  fontSize="small"
                />
                Delete
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleMenuClose(); // Close the menu first
                  setPendingCompareBranch(params.row.name); // Save pending branch
                }}
                sx={{
                  color: "#0284c7",
                  minWidth: 120,
                  fontWeight: 700,
                  "&:hover": {
                    bgcolor: "#e0f2fe",
                    color: "#0ea5e9",
                  },
                  textTransform: "none",
                }}
              >
                <CompareArrowsIcon
                  fontSize="small"
                  sx={{ color: "#0ea5e9", mr: 1, verticalAlign: "middle" }}
                />
                Compare With...
              </MenuItem>

              <Dialog
                open={compareDialogOpen}
                onClose={() => setCompareDialogOpen(false)}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>Compare Branches</DialogTitle>
                <DialogContent>
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <Typography component="span" sx={{ fontWeight: 700 }}>
                      Base:
                    </Typography>
                    {baseBranch ? (
                      <Chip
                        label={baseBranch}
                        sx={{
                          ml: 1,
                          display: "inline-flex",
                          verticalAlign: "middle",
                        }}
                      />
                    ) : (
                      <Typography component="span" sx={{ ml: 1 }}>
                        -
                      </Typography>
                    )}
                  </Box>

                  <Autocomplete
                    options={branches
                      .map((b) => b.name)
                      .filter((name) => name !== baseBranch)}
                    value={compareBranch}
                    onChange={(_, val) => setCompareBranch(val || "")}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select branch to compare with"
                      />
                    )}
                    fullWidth
                    disableClearable
                    sx={{ mb: 2 }}
                  />

                  {compareLoading && (
                    <Box textAlign="center" py={2}>
                      <CircularProgress />
                    </Box>
                  )}

                  {/* Show/Hide Changed Files Table */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={showChangeset}
                        onChange={(e) => setShowChangeset(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Show changed files (Files Changed Table)"
                    sx={{ mt: 1 }}
                  />

                  {compareResult && (
                    <Paper
                      variant="outlined"
                      sx={{ mt: 2, p: 2, bgcolor: "background.paper" }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ mb: 2, color: "#0284c7", fontWeight: 900 }}
                      >
                        <CompareArrowsIcon
                          sx={{ mr: 1, verticalAlign: "middle" }}
                        />{" "}
                        Comparison Result
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          mb: 2,
                          gap: 2,
                        }}
                      >
                        <Chip
                          label={`Base: ${baseBranch}`}
                          color="primary"
                          sx={{
                            fontWeight: 700,
                            bgcolor: "#0ea5e9",
                            color: "#fff",
                          }}
                        />
                        <Chip
                          label={`Compared: ${compareBranch}`}
                          color="success"
                          sx={{
                            fontWeight: 700,
                            bgcolor: "#22c55e",
                            color: "#fff",
                          }}
                        />
                        <Chip
                          label={`Files Changed: ${compareResult.stats?.length ?? 0}`}
                          color="secondary"
                        />
                      </Box>
                      <Divider sx={{ mb: 2 }} />

                      {/* Commits only in base */}
                      <Box sx={{ mb: 3 }}>
                        <Alert
                          icon={false}
                          severity="info"
                          sx={{
                            fontWeight: 900,
                            color: "#0ea5e9",
                            mb: 1,
                            bgcolor: "#e0f2fe",
                          }}
                        >
                          Commits only in <b>{baseBranch}</b> (
                          {compareResult.commits?.onlyInBase?.length ?? 0})
                        </Alert>
                        {compareResult?.commits?.onlyInBase?.length > 0 ? (
                          <Box>
                            {compareResult.commits.onlyInBase.map((c, i) => (
                              <Paper
                                key={c.hash || i}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  p: 1.1,
                                  borderRadius: 2,
                                  mb: 1,
                                  bgcolor: i % 2 === 0 ? "#f3fafd" : "#e9f7fe",
                                  borderLeft: "4px solid #0ea5e9",
                                }}
                                elevation={0}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: stringToColor(c.author),
                                    width: 32,
                                    height: 32,
                                    mr: 1,
                                  }}
                                >
                                  {c.author?.[0]?.toUpperCase() ?? "?"}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      fontWeight: 700,
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {c.message}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "#555", fontWeight: 500 }}
                                  >
                                    <span style={{ color: "#0181c2" }}>
                                      {c.author}
                                    </span>
                                    {c.hash && (
                                      <Tooltip title={c.hash}>
                                        <Button
                                          size="small"
                                          sx={{
                                            ml: 1,
                                            color: "#94a3b8",
                                            fontFamily: "monospace",
                                            minWidth: 0,
                                          }}
                                          onClick={() =>
                                            navigator.clipboard.writeText(
                                              c.hash,
                                            )
                                          }
                                        >
                                          #{c.hash.slice(0, 7)}
                                          <ContentCopyIcon
                                            sx={{ fontSize: 18, ml: 0.5 }}
                                          />
                                        </Button>
                                      </Tooltip>
                                    )}
                                  </Typography>
                                </Box>
                              </Paper>
                            ))}
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: "#64748b", pl: 1.5 }}
                          >
                            None
                          </Typography>
                        )}
                      </Box>

                      {/* Commits only in compare */}
                      <Box sx={{ mb: 3 }}>
                        <Alert
                          icon={false}
                          severity="success"
                          sx={{
                            fontWeight: 900,
                            color: "#22c55e",
                            mb: 1,
                            bgcolor: "#d3fbe9",
                          }}
                        >
                          Commits only in <b>{compareBranch}</b> (
                          {compareResult.commits?.onlyInCompare?.length ?? 0})
                        </Alert>
                        {compareResult?.commits?.onlyInCompare?.length > 0 ? (
                          <Box>
                            {compareResult.commits.onlyInCompare.map((c, i) => (
                              <Paper
                                key={c.hash || i}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  p: 1.1,
                                  borderRadius: 2,
                                  mb: 1,
                                  bgcolor: i % 2 === 0 ? "#f6fcf6" : "#e9fdeb",
                                  borderLeft: "4px solid #22c55e",
                                }}
                                elevation={0}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: stringToColor(c.author),
                                    width: 32,
                                    height: 32,
                                    mr: 1,
                                  }}
                                >
                                  {c.author?.[0]?.toUpperCase() ?? "?"}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      fontWeight: 700,
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {c.message}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "#555", fontWeight: 500 }}
                                  >
                                    <span style={{ color: "#0e8c3f" }}>
                                      {c.author}
                                    </span>
                                    {c.hash && (
                                      <Tooltip title={c.hash}>
                                        <Button
                                          size="small"
                                          sx={{
                                            ml: 1,
                                            color: "#166534",
                                            fontFamily: "monospace",
                                            minWidth: 0,
                                          }}
                                          onClick={() =>
                                            navigator.clipboard.writeText(
                                              c.hash,
                                            )
                                          }
                                        >
                                          #{c.hash.slice(0, 7)}
                                          <ContentCopyIcon
                                            sx={{ fontSize: 18, ml: 0.5 }}
                                          />
                                        </Button>
                                      </Tooltip>
                                    )}
                                  </Typography>
                                </Box>
                              </Paper>
                            ))}
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: "#64748b", pl: 1.5 }}
                          >
                            None
                          </Typography>
                        )}
                      </Box>

                      {/* Files Changed Table (conditional on showChangeset) */}
                      {showChangeset && (
                        <>
                          {compareResult.stats?.length > 0 ? (
                            <Paper
                              variant="outlined"
                              sx={{ mb: 1, p: 1, bgcolor: "#f4f6fb" }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700, mb: 1 }}
                              >
                                Files Changed ({compareResult.stats.length})
                              </Typography>
                              <Box
                                component="table"
                                sx={{ width: "100%", fontSize: 15 }}
                              >
                                <thead>
                                  <tr style={{ color: "#64748b" }}>
                                    <th align="left">File</th>
                                    <th align="right">+ Added</th>
                                    <th align="right">– Deleted</th>
                                    <th align="right">Net</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {compareResult.stats.map((row, idx) => (
                                    <tr key={row.file}>
                                      <td style={{ wordBreak: "break-all" }}>
                                        {row.file}
                                      </td>
                                      <td
                                        align="right"
                                        style={{ color: "#16a34a" }}
                                      >
                                        +{row.added}
                                      </td>
                                      <td
                                        align="right"
                                        style={{ color: "#dc2626" }}
                                      >
                                        -{row.deleted}
                                      </td>
                                      <td
                                        align="right"
                                        style={{
                                          fontWeight: 700,
                                          color:
                                            row.net > 0
                                              ? "#166534"
                                              : row.net < 0
                                                ? "#dc2626"
                                                : "#64748b",
                                        }}
                                      >
                                        {row.net}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Box>
                            </Paper>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{ color: "#64748b", pl: 1.5 }}
                            >
                              No files changed.
                            </Typography>
                          )}
                        </>
                      )}
                    </Paper>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => setCompareDialogOpen(false)}
                    color="secondary"
                  >
                    Close
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!baseBranch || !compareBranch || compareLoading}
                    onClick={handleCompareBranches}
                  >
                    {compareLoading ? "Comparing..." : "Compare"}
                  </Button>
                </DialogActions>
              </Dialog>
            </Menu>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        mt: 4,
        mb: 4,
        width: "75vw", // almost the whole viewport
        maxWidth: "none", // fully overrides MUI's default
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2, // Adds space between icon and text (optional)
          mb: 2, // Margin below header (optional)
        }}
      ></Box>
      <Paper
        elevation={8}
        sx={{
          p: { xs: 2, md: 4 },
          bgcolor: "#f9fafb",
          borderRadius: 4,
          boxShadow: "0 2px 18px 1px #e5e7eb",
        }}
      >
        {" "}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 3,
            borderBottom: "2.5px solid #0ea5e9",
            pb: 2,
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", position: "sticky" }}
          >
            <CloudPulseLogo />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                ml: 1,
                background: "linear-gradient(90deg, #0ea5e9 90%, #38bdf8 110%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                whiteSpace: "nowrap",
              }}
            >
              Git Dashboard
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "nowrap",
              overflowX: "auto",
              mt: 2,
              mb: 2,
            }}
          >
            <AppButton
              startIcon={<AddIcon />}
              onClick={() => {
                setCreateBranchDialogOpen(true);
                setCreateBranchRemote("");
                setCreateBranchTarget("");
                setCreateBranchName("");
              }}
              disabled={isOpeningCreateDialog}
              sx={{ minWidth: 128 }}
            >
              Create
            </AppButton>

            <AppButton
              startIcon={<SyncIcon />}
              loading={isPulling}
              onClick={handlePull}
              disabled={isPulling}
              sx={{ minWidth: 128 }}
            >
              Pull
            </AppButton>

            <AppButton
              startIcon={<SettingsBackupRestoreIcon />} // "restore" or "save" for stash
              loading={isStashing}
              onClick={handleStashChanges}
              disabled={isStashing}
              sx={{ minWidth: 128 }}
            >
              Stash
            </AppButton>

            <FloatingWhiteTooltip
              title={
                lastEnvKey && ENV_LABELS[lastEnvKey]
                  ? `You are currently running the application in the "${ENV_LABELS[lastEnvKey]}" environment.`
                  : "Switch environment"
              }
              arrow
              placement="bottom"
              componentsProps={{
                tooltip: {
                  sx: {
                    background:
                      "linear-gradient(90deg, #0ea5e9 80%, #38bdf8 100%)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "15px",
                    borderRadius: 1.5,
                    boxShadow: "0 3px 16px #0ea5e9cc",
                    px: 2.2,
                    py: 1.15,
                  },
                },
                arrow: {
                  sx: { color: "#0ea5e9" },
                },
              }}
            >
              {/* Tooltip can directly wrap AppButton */}
              <span>
                <AppButton
                  startIcon={<CompareArrowsIcon />} // arrows for switch/swap
                  onClick={handleOpenEnvSwitcher}
                  sx={{ minWidth: 128 }}
                >
                  Switch
                </AppButton>
              </span>
            </FloatingWhiteTooltip>

            <AppButton
              startIcon={<PowerSettingsNewIcon />} // power/start symbol for start
              onClick={handleStartService}
              sx={{ minWidth: 128 }}
            >
              Start
            </AppButton>

            <AppButton
              onClick={() => setAutomationDialogOpen(true)}
              startIcon={<PlayCircleOutlineIcon />} // play symbol for run/test
              sx={{ minWidth: 128 }}
            >
              Run Specs
            </AppButton>

            <AppButton
              color="secondary"
              startIcon={<CloudUploadIcon />} // upload/cloud for add remote
              onClick={() => setAddRemoteDialogOpen(true)}
              sx={{ minWidth: 128 }}
            >
              Add Remote
            </AppButton>

            <AppButton
              color="secondary"
              onClick={handleOpenRemoveRemote}
              startIcon={<CloudOffIcon />}
              sx={{
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 2,
                px: 1.1,
                py: 1.1,
                minWidth: 0, // ensures autosize, not forced wide
                textTransform: "none",
                boxShadow: "0 2px 8px #0ea5e950",
                background: "linear-gradient(90deg, #0ea5e9 90%, #38bdf8 110%)",
                color: "#fff",
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #2563eb 80%, #38bdf8 100%)",
                  border: "2px solid #0ea5e9",
                  boxShadow: "0 4px 16px #0ea5e980",
                },
              }}
            >
              Remove Remote
            </AppButton>
          </Box>

          <Dialog
            open={removeRemoteDialogOpen}
            onClose={() => setRemoveRemoteDialogOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: 3,
                minWidth: 400,
                p: 1,
                boxShadow: "0 8px 40px #00000030",
                backgroundColor: "#fff",
              },
            }}
          >
            <DialogTitle
              sx={{
                fontWeight: 700,
                textAlign: "center",
                fontSize: 24,
                pb: 0,
                pt: 2,
                letterSpacing: 0,
              }}
            >
              Remove Remote
            </DialogTitle>
            <DialogContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pt: 2,
                pb: 0,
              }}
            >
              <RadioGroup
                value={selectedRemote}
                onChange={(e) => setSelectedRemote(e.target.value)}
                sx={{ width: "100%" }}
              >
                {remotes.map((remote) => (
                  <FormControlLabel
                    key={remote}
                    value={remote}
                    control={<Radio />}
                    label={
                      <Typography sx={{ fontSize: 18 }}>{remote}</Typography>
                    }
                    sx={{ my: 1 }}
                  />
                ))}
              </RadioGroup>
              {remotes.length === 0 && (
                <Typography sx={{ fontSize: 18, color: "#888" }}>
                  No remotes available
                </Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                onClick={() => setRemoveRemoteDialogOpen(false)}
                sx={{
                  color: "#0ea5e9",
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: 16,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                disabled={!selectedRemote}
                onClick={handleDeleteRemote}
                sx={{
                  fontWeight: 700,
                  fontSize: 16,
                  textTransform: "none",
                  borderRadius: 2,
                  alignItems: "center",
                  px: 3,
                  py: 1,
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            open={snackbar.open}
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            autoHideDuration={3000}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>

          <Dialog
            open={addRemoteDialogOpen}
            onClose={() => {
              setAddRemoteDialogOpen(false);
              setNewRemoteName("");
              setNewRemoteUrl("");
            }}
          >
            <DialogTitle>Add Git Remote</DialogTitle>
            <DialogContent>
              <TextField
                label="Remote Name"
                value={newRemoteName}
                onChange={(e) => setNewRemoteName(e.target.value)}
                fullWidth
                margin="normal"
                autoFocus
                required
              />
              <TextField
                label="Remote URL"
                value={newRemoteUrl}
                onChange={(e) => setNewRemoteUrl(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setAddRemoteDialogOpen(false);
                  setNewRemoteName("");
                  setNewRemoteUrl("");
                }}
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddRemote}
                color="primary"
                variant="contained"
                disabled={!newRemoteName || !newRemoteUrl || isAddingRemote}
              >
                {isAddingRemote ? "Adding..." : "Create"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
        <Dialog
          open={automationDialogOpen}
          onClose={() => setAutomationDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: "#fcfeff",
              borderRadius: 4,
              border: "3px solid #38bdf8",
              boxShadow: "0 8px 36px #94a3b840",
              minWidth: { xs: "95vw", sm: 540 },
              p: 1,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 800,
              color: "#0ea5e9",
              fontSize: 22,
              letterSpacing: 1,
              borderRadius: "14px 14px 0 0",
              bgcolor: "#e0f2fe",
              borderBottom: "2px solid #38bdf8",
              display: "flex",
              alignItems: "center",
            }}
          >
            Run Cypress Automation
            <IconButton
              sx={{ ml: "auto" }}
              onClick={() => setAutomationDialogOpen(false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ py: 2 }}>
            {specLoading ? (
              <Box textAlign="center" py={4}>
                <CircularProgress />
              </Box>
            ) : specList.length === 0 ? (
              <Typography>No specs found.</Typography>
            ) : (
              <>
                <Box display="flex" alignItems="center" mb={2}>
                  <Checkbox
                    checked={selectAll}
                    indeterminate={
                      checkedSpecs.length > 0 &&
                      checkedSpecs.length < specList.length
                    }
                    onChange={(e) => {
                      setSelectAll(e.target.checked);
                      setCheckedSpecs(e.target.checked ? [...specList] : []);
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Select All
                  </Typography>
                </Box>
                <Box sx={{ overflowY: "auto", pr: 2, position: "sticky" }}>
                  {specList.map((spec) => (
                    <Box key={spec} display="flex" alignItems="center" py={0.2}>
                      <Checkbox
                        checked={checkedSpecs.includes(spec)}
                        onChange={() => {
                          let newChecked;
                          if (checkedSpecs.includes(spec)) {
                            newChecked = checkedSpecs.filter((s) => s !== spec);
                            setSelectAll(false);
                          } else {
                            newChecked = [...checkedSpecs, spec];
                            if (newChecked.length === specList.length)
                              setSelectAll(true);
                          }
                          setCheckedSpecs(newChecked);
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "monospace",
                          color: "#0ea5e9",
                          fontWeight: 600,
                        }}
                      >
                        {spec.split("/").pop()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </DialogContent>

          <DialogActions
            sx={{ borderTop: "1px solid #e0e7ef", bgcolor: "#f1f8ff" }}
          >
            <Button onClick={() => setAutomationDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={checkedSpecs.length === 0}
              onClick={() => {
                setAutomationDialogOpen(false);        // 1. Close the dialog immediately
                handleRunSpecs(checkedSpecs);          // 2. Then run the specs
              }}
 >
              Run Selected{" "}
              {checkedSpecs.length > 0 ? `(${checkedSpecs.length})` : ""}
            </Button>
          </DialogActions>
        </Dialog>
        {/* Create Branch Dialog */}
        <Dialog
          open={createBranchDialogOpen}
          onClose={() => setCreateBranchDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
            Create New Branch
            <IconButton
              sx={{ ml: "auto" }}
              onClick={() => setCreateBranchDialogOpen(false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Autocomplete
              options={remotes}
              value={createBranchRemote}
              onChange={(_, val) => {
                setCreateBranchRemote(val ?? "");
                setCreateBranchTarget("");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Remote Repo"
                  fullWidth
                  margin="dense"
                />
              )}
              freeSolo={false}
            />

            {/* Target Branch input / autocomplete */}
            {createBranchRemote === "" ? (
              <TextField
                label="Target Branch"
                fullWidth
                margin="dense"
                disabled
                value=""
                helperText="Select a remote first"
              />
            ) : createBranchRemote === "aclp" ? (
              <Autocomplete
                freeSolo
                options={["aclp_develop"]}
                value={createBranchTarget}
                onChange={(_, val) => setCreateBranchTarget(val ?? "")}
                onInputChange={(_, val) => setCreateBranchTarget(val)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Target Branch"
                    fullWidth
                    margin="dense"
                    helperText="Autocomplete: aclp_develop"
                  />
                )}
              />
            ) : createBranchRemote === "linode" ? (
              <Autocomplete
                freeSolo
                options={["develop", "staging"]}
                value={createBranchTarget}
                onChange={(_, val) => setCreateBranchTarget(val ?? "")}
                onInputChange={(_, val) => setCreateBranchTarget(val)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Target Branch"
                    fullWidth
                    margin="dense"
                    helperText="Autocomplete: de, develop, staging"
                  />
                )}
              />
            ) : (
              <TextField
                label="Target Branch"
                fullWidth
                margin="dense"
                value={createBranchTarget}
                onChange={(e) => setCreateBranchTarget(e.target.value)}
                helperText="Enter target branch"
                autoComplete="off"
                spellCheck={false}
              />
            )}

            <TextField
              label="New Branch Name"
              fullWidth
              margin="dense"
              value={createBranchName}
              onChange={(e) => setCreateBranchName(e.target.value)}
              helperText="Short descriptive name (no spaces)"
            />

            <Box
              sx={{ mt: 2, color: "#6b7280", fontSize: 14, position: "sticky" }}
            >
              <strong>Will Create:</strong>{" "}
              <span
                style={{
                  background: "linear-gradient(90deg,#0ea5e9,#2563eb,#f43f5e)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 700,
                }}
              >
                {createBranchName && createBranchRemote ? (
                  `${createBranchName}_${createBranchRemote}_${new Date().toLocaleString(
                    "en-US",
                    {
                      month: "long",
                    },
                  )}_${String(new Date().getDate()).padStart(2, "0")}`
                ) : (
                  <i>Complete form above</i>
                )}
              </span>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              disabled={
                !createBranchRemote ||
                !createBranchTarget ||
                !createBranchName ||
                isSubmittingCreate
              }
              onClick={handleCreateBranch}
              startIcon={
                isSubmittingCreate ? (
                  <CircularProgress color="inherit" size={18} />
                ) : (
                  <AddIcon />
                )
              }
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                px: 2.5,
                py: 1,
              }}
            >
              {isSubmittingCreate ? "Creating..." : "Create Branch"}
            </Button>

            <Button onClick={() => setCreateBranchDialogOpen(false)}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
        {/* Force Pull Confirm Dialog */}
        <Dialog
          open={forcePullConfirmOpen}
          onClose={() => setForcePullConfirmOpen(false)}
        >
          <DialogTitle>Uncommitted Changes Detected</DialogTitle>
          <DialogContent>
            <Typography color="error" sx={{ fontWeight: 700 }}>
              ⚠ You have uncommitted local changes.
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Please commit or stash your changes before pulling, or force pull
              (this will <b>discard ALL uncommitted changes</b>).
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button color="error" onClick={forcePull}>
              Force Pull (Discard All Local)
            </Button>
            <Button onClick={() => setForcePullConfirmOpen(false)}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
        {/* Checkout Branch Dialog */}
        <Dialog
          open={checkoutDialogOpen}
          onClose={() => setCheckoutDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>
            Checkout Branch
            <IconButton
              sx={{ ml: "auto" }}
              onClick={() => setCheckoutDialogOpen(false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <TextField
              label="Branch Name"
              fullWidth
              margin="dense"
              value={checkoutBranchName}
              onChange={(e) => setCheckoutBranchName(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              helperText="Enter the branch name to checkout"
              disabled={isCheckingOut}
              autoFocus
            />
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => !isCheckingOut && setCheckoutDialogOpen(false)}
              disabled={isCheckingOut}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={!checkoutBranchName.trim() || isCheckingOut}
              onClick={handleCheckoutBranch}
              startIcon={
                isCheckingOut ? (
                  <CircularProgress color="inherit" size={18} />
                ) : null
              }
              sx={{ minWidth: 120 }} // prevent layout jump when spinner appears
            >
              {isCheckingOut ? "Checking out..." : "Checkout"}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={envSwitcherOpen}
          onClose={handleCloseEnvSwitcher}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
            Switch Environment
            <IconButton
              sx={{ ml: "auto" }}
              onClick={handleCloseEnvSwitcher}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Autocomplete
              options={ENV_OPTIONS}
              value={selectedEnv}
              onChange={(_, value) => setSelectedEnv(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Environment"
                  fullWidth
                  margin="dense"
                  autoFocus
                />
              )}
            />
            {envMessage && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {envMessage}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEnvSwitcher} disabled={envLoading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={!selectedEnv || envLoading}
              onClick={handleConfirmEnvSwitch}
              startIcon={
                envLoading ? (
                  <CircularProgress color="inherit" size={18} />
                ) : null
              }
            >
              {envLoading ? "Switching..." : "Confirm"}
            </Button>
          </DialogActions>
        </Dialog>
        <Box>
          {/* Your search bar component here (as before) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "#fff",
              border: "2.5px solid #bae6fd",
              boxShadow: "0 4px 28px 0 #0284c71b",
              borderRadius: 3,
              px: 2,
              py: 1.1,
              maxWidth: 420,
              width: "100%",
              transition: "border 0.25s, box-shadow 0.25s",
              "&:focus-within": {
                borderColor: "#0ea5e9",
                boxShadow: "0 8px 16px #0284c74a",
              },
            }}
          >
            <SearchIcon sx={{ color: "#0ea5e9", mr: 1.4, fontSize: 28 }} />
            <Autocomplete
              freeSolo
              fullWidth
              disablePortal
              options={filteredSuggestions}
              inputValue={search}
              PaperComponent={(props) => (
                <SuggestionPaper
                  {...props}
                  branchCount={filteredSuggestions.length}
                />
              )}
              noOptionsText="No matching branches found"
              onInputChange={(event, newInputValue, reason) => {
                setSearch(newInputValue);
                if (reason === "clear" || newInputValue === "") setQuery("");
              }}
              onChange={(event, newValue) => {
                if (newValue !== null) {
                  setQuery(newValue);
                  setSearch(newValue);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Type to see suggestions, Press Enter to search"
                  variant="standard"
                  InputProps={{
                    ...params.InputProps,
                    disableUnderline: true,
                  }}
                  sx={{
                    bgcolor: "transparent",
                    "& input": { fontSize: 18 },
                  }}
                />
              )}
              renderOption={(props, option, { selected }) => (
                <Box
                  component="li"
                  {...props}
                  sx={{
                    px: 2,
                    py: 1.1,
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#0284c7",
                    borderRadius: 2,
                    cursor: "pointer",
                    mb: 0.2,
                    background: selected ? "#e0f2fe" : "#fff",
                    "&:hover": {
                      background: "#bae6fd",
                      color: "#2563eb",
                    },
                    transition: "background 120ms",
                  }}
                >
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      width: "100%",
                      display: "block",
                    }}
                  >
                    {option}
                  </span>
                </Box>
              )}
            />
          </Box>
          {/* Search bar ends here */}

          {/* Print count below the search bar */}
          <Typography
            sx={{
              color: branches.length === 0 ? "#94a3b8" : "#0ea5e9",
              fontWeight: 400,
              fontSize: 13.5,
              ml: 1,
              mt: 0.5,
              mb: 0.3,
              letterSpacing: 0.04,
              userSelect: "none",
            }}
          >
            {branches.length} {branches.length === 1 ? "branch" : "branches"}{" "}
            shown
          </Typography>
        </Box>
        {/* Current branch display */}
        <Box
          sx={{
            mb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            position: "sticky",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "#2563eb" }}
          >
            Current Branch:
          </Typography>
          <FloatingWhiteTooltip title={currentBranch || "Loading..."}>
            <span>
              <Chip
                label={currentBranch || "Loading..."}
                color="primary"
                variant="outlined"
                size="small"
                clickable
                onClick={handleShowBranchLog}
                sx={{
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 15,
                  bgcolor: "#e0f2fe",
                  color: "#0284c7",
                  "&:hover": {
                    bgcolor: "#bae6fd",
                    boxShadow: "0 0 0 2px #0ea5e9",
                  },
                  maxWidth: 280,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              />
            </span>
          </FloatingWhiteTooltip>
        </Box>
         {/* Branch Table */}
        <Box sx={{ mb: 1 }}></Box>
        <Paper
          elevation={4}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "#f0f9ff",
            border: "2.5px solid #0ea5e9",
            boxShadow: "0 4px 20px rgb(14 165 233 / 0.3)",
            mb: 3,
          }}
        >
<Box sx={{ mt: 3, mb: 2 }}>
  <Paper variant="outlined" sx={{
    p: 1.5,
    borderRadius: 3,
    bgcolor: "#f0f9ff",
    boxShadow: "0 2px 18px #bae6fd22",
    minHeight: 50,
  }}>
    <Box sx={{ display: "flex", alignItems: "center" }}>
    <Typography sx={{ fontWeight: 700, fontSize: 17, mr: 1, color: '#0ea5e9' }}>
      Cypress Output
    </Typography>

      <Tooltip title={outputOpen ? "Minimize" : "Maximize"}>
        <IconButton size="small" onClick={() => setOutputOpen(o => !o)}>
          {outputOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Tooltip>
      <Tooltip title="Copy Output">
        <IconButton
          size="small"
          sx={{ ml: 0.5 }}
          onClick={() => {
            navigator.clipboard.writeText(runOutput + (runError ? "\n" + runError : ""));
            setSnackbar({ open: true, message: "Output copied to clipboard!", severity: "success" });
          }}
        >
          <ContentCopyIcon />
        </IconButton>
      </Tooltip>
    </Box>
    <Collapse in={outputOpen}>
    <Box
  sx={{
    bgcolor: "#171717",   // Black background (tailwind neutral-900)
    color: "#fff",        // White text
    borderRadius: 2,
    p: 2,
    whiteSpace: "pre-wrap",
    fontFamily: "monospace",
    fontSize: 14,
    minHeight: 120,
    overflowY: "auto",
  }}
>
  {isRunning 
    ? "Running specs..."
    : runOutput || runError || "No Cypress output yet."
  }
</Box>

    </Collapse>
  </Paper>
</Box>

          <Box sx={{ overflowX: "auto", position: "sticky" }}>
            <DataGrid
              autoHeight
              rows={branches}
              columns={columns}
              checkboxSelection
              pageSize={2}
              pagination
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              disableColumnMenu
              disableColumnSelector
              disableRowSelectionOnClick
              selectionModel={selectionModel}
              onRowSelectionModelChange={setSelectionModel}
              loading={branches.length === 0 && suggestions.length === 0}
              rowsPerPageOptions={[15, 30, 50]}
              getRowId={(row) => row.id}
              // checkboxSelection
              sx={{
                fontSize: 16,
                bgcolor: "#f0f9ff",
                borderRadius: 2,
                border: "none",
                "& .MuiDataGrid-row:hover": { bgcolor: "#d7f0fe" },
                "& .MuiDataGrid-checkboxInput": { color: "#0ea5e9" },
                "& .MuiDataGrid-cell": { fontWeight: 400 },
                "& .MuiDataGrid-columnHeaders": {
                  bgcolor: "#e0f2fe",
                  borderBottom: "2.5px solid #0ea5e9",
                  fontWeight: 700,
                  fontSize: 17,
                },
              }}
              components={{
                LoadingOverlay,
                NoRowsOverlay: () => (
                  <Typography sx={{ mt: 6, fontSize: 22, color: "#8c8c8c" }}>
                    No data to display.
                  </Typography>
                ),
              }}
            />
          </Box>
          <Typography sx={{ mt: 2, fontSize: 14, color: "#64748b" }}>
            Showing {pageSize} per page | {branches.length} branches
          </Typography>
          <Dialog
            open={branchLogDialogOpen}
            onClose={() => setBranchLogDialogOpen(false)}
            maxWidth="md"
            PaperProps={{
              sx: {
                bgcolor: "#fcfeff",
                borderRadius: 4,
                p: 2,
                minWidth: { xs: "95vw", sm: 540 },
              },
            }}
          >
            <DialogTitle sx={{ fontWeight: 700, color: "#0284c7" }}>
              Commit History ─ {currentBranch}
            </DialogTitle>
            <DialogContent sx={{ maxHeight: 500, overflowY: "auto" }}>
              {branchLogLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : branchLogError ? (
                <Alert severity="error">{branchLogError}</Alert>
              ) : branchLogList.length === 0 ? (
                <Typography color="text.secondary" sx={{ my: 2 }}>
                  No commits found.
                </Typography>
              ) : (
                <Box>
                  {branchLogList.map((log, idx) => (
                    <Paper
                      key={log.commit + idx}
                      sx={{
                        my: 2,
                        p: 2,
                        bgcolor: "#e0f2fe",
                        boxShadow: "none",
                        borderLeft: "6px solid #0ea5e9",
                      }}
                    >
                      {/* --- HERE IS THE CHANGED PART --- */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 0.6,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: "#2563eb",
                              fontWeight: 700,
                              display: "inline",
                            }}
                          >
                            {log.message}
                          </Typography>
                          {/* Ticket links block */}
                          {log.tickets && log.tickets.length > 0 && (
                            <span style={{ marginLeft: 10 }}>
                              {log.tickets.map((ticket) => (
                                <a
                                  key={ticket}
                                  href={`https://track.akamai.com/jira/browse/${ticket}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: "#fff",
                                    background: "#2563eb",
                                    borderRadius: "7px",
                                    padding: "1px 7px",
                                    marginRight: "8px",
                                    fontWeight: 700,
                                    fontSize: 13,
                                    textDecoration: "none",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  {ticket}
                                </a>
                              ))}
                            </span>
                          )}
                        </Box>
                        <Chip
                          label={log.date}
                          size="small"
                          sx={{
                            ml: 1,
                            bgcolor: "#e0e7ff",
                            color: "#334155",
                            fontWeight: 700,
                          }}
                        />
                      </Box>
                      {/* rest of your Paper stays the same */}
                      <Box
                        sx={{
                          fontSize: 14,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <span style={{ color: "#6b7280" }}>Commit:</span>
                          <code style={{ color: "#0284c7", fontSize: 15 }}>
                            {log.commit.slice(0, 8)}…
                          </code>
                          <Tooltip title="Copy commit id">
                            <IconButton
                              onClick={() => handleCopyCommit(log.commit)}
                              size="small"
                              sx={{ ml: 0.5, color: "#0891b2" }}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Box>
                          <span style={{ color: "#6b7280" }}>Author:</span>
                          <span style={{ fontWeight: 500, marginLeft: 6 }}>
                            {log.author}
                          </span>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </DialogContent>

            <DialogActions>
              <Button
                onClick={() => setBranchLogDialogOpen(false)}
                variant="outlined"
                sx={{ fontWeight: 700, borderRadius: 2 }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
        {/* Confirm Delete Selected Snackbar */}
        {/* Confirm Delete Selected Dialog */}
        <Dialog
          open={confirmDelete.open}
          onClose={() => setConfirmDelete({ open: false, branchName: "" })}
          aria-labelledby="delete-branch-dialog-title"
          maxWidth="xs"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: 4,
                bgcolor: "#fff",
                p: 0,
                overflow: "visible",
                minWidth: "fit-content",
                maxWidth: 300,
              },
            },
          }}
        >
          <DialogTitle
            id="delete-branch-dialog-title"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "#e0f2fe", // light blue header
              color: "#1674d3",
              borderRadius: "4px 4px 0 0",
              borderBottom: "1.5px solid #38bdf8",
              fontWeight: 700,
              fontSize: 22,
              pb: 1,
              pt: 2,
            }}
          >
            <WarningAmberRoundedIcon sx={{ color: "#38bdf8", mr: 1 }} />
            Confirm Deletion
          </DialogTitle>
          <DialogContent sx={{ py: 2.5, px: 3 }}>
            <Typography variant="body1" sx={{ fontSize: 18, color: "#164e63" }}>
              Are you sure you want to delete branch{" "}
              <span style={{ color: "#dc2626", fontWeight: 700 }}>
                {confirmDelete.branchName}
              </span>
              ?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2, pt: 0 }}>
            <Button
              color="error"
              variant="contained"
              sx={{
                minWidth: 110,
                fontWeight: 700,
                borderRadius: 2,
                fontSize: 18,
                px: 3,
                py: 1.2,
                boxShadow: "0 2px 8px #38bdf84a",
              }}
              onClick={handleConfirmDelete}
              disabled={deletingBranches.has(confirmDelete.branchName)}
              startIcon={
                deletingBranches.has(confirmDelete.branchName) ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <DeleteIcon />
                )
              }
            >
              {deletingBranches.has(confirmDelete.branchName)
                ? "Deleting..."
                : "DELETE"}
            </Button>
            <Button
              color="info"
              variant="outlined"
              sx={{
                minWidth: 110,
                fontWeight: 700,
                borderRadius: 2,
                fontSize: 18,
                ml: 2,
                px: 3,
                py: 1.2,
                color: "#1674d3",
                borderColor: "#38bdf8",
                background: "#e0f2fe",
                "&:hover": {
                  borderColor: "#2563eb",
                  color: "#2563eb",
                  background: "#bae6fd",
                },
              }}
              onClick={() => setConfirmDelete({ open: false, branchName: "" })}
              disabled={deletingBranches.has(confirmDelete.branchName)}
            >
              CANCEL
            </Button>
          </DialogActions>
        </Dialog>
        {/* General Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        {/* TS File Stats Dialog */}
        <Dialog
          open={statsOpen}
          onClose={() => setStatsOpen(false)}
          maxWidth="sm"
          PaperProps={{
            sx: {
              bgcolor: "#ffffff",
              borderRadius: 4,
              borderLeft: "8px solid #0ea5e9",
              boxShadow: "0 8px 32px #dbeafe80",
              minWidth: { xs: "95vw", sm: "540px" },
              p: 1,
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              pb: 0.5,
              bgcolor: "#f0f9ff",
              borderRadius: "10px 10px 0 0",
              fontWeight: 800,
              color: "#0ea5e9",
            }}
          >
            <GitHubIcon sx={{ color: "#0ea5e9" }} />
            .ts File Change Stats — <span>{statsBranch}</span>
            <IconButton
              onClick={() => setStatsOpen(false)}
              sx={{ ml: "auto" }}
              aria-label="Close"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ py: 2 }}>
            {statsLoading && (
              <Box sx={{ textAlign: "center", my: 3, position: "sticky" }}>
                <CircularProgress
                  thickness={5}
                  size={44}
                  sx={{ color: "#0ea5e9" }}
                />
              </Box>
            )}
            {!statsLoading && statsError && (
              <Typography
                color="error"
                sx={{ mt: 3, mb: 3, fontSize: 22, textAlign: "center" }}
              >
                {statsError}
              </Typography>
            )}
            {!statsLoading &&
              !statsError &&
              Array.isArray(statsData) &&
              statsData.length > 0 && (
                <Box sx={{ mt: 2, mb: 1, position: "sticky" }}>
                  <Paper
                    elevation={2}
                    sx={{ borderRadius: 3, p: 2, bgcolor: "#f3f7fa" }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: "0 8px",
                        fontSize: 16,
                      }}
                    >
                      <thead>
                        <tr style={{ fontWeight: 700, color: "#0ea5e9" }}>
                          <th style={{ textAlign: "left", padding: 8 }}>
                            File
                          </th>
                          <th style={{ padding: 8 }}>+ Added</th>
                          <th style={{ padding: 8 }}>– Deleted</th>
                          <th style={{ padding: 8 }}>Net</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statsData.map((row) => (
                          <tr key={row.file} style={{ background: "#fff" }}>
                            <td
                              style={{
                                padding: 8,
                                fontFamily: "monospace",
                                fontSize: 15,
                                fontWeight: 600,
                                wordBreak: "break-all",
                              }}
                            >
                              {row.file}
                            </td>
                            <td style={{ padding: 8 }}>
                              <Chip
                                label={`+${row.added}`}
                                sx={{
                                  bgcolor: "#e0fce4",
                                  color: "#16a34a",
                                  fontWeight: 700,
                                }}
                              />
                            </td>
                            <td style={{ padding: 8 }}>
                              <Chip
                                label={`–${row.deleted}`}
                                sx={{
                                  bgcolor: "#fee2e2",
                                  color: "#dc2626",
                                  fontWeight: 700,
                                }}
                              />
                            </td>
                            <td style={{ padding: 8 }}>
                              <Chip
                                label={
                                  row.net > 0
                                    ? `+${row.net}`
                                    : row.net < 0
                                      ? `${row.net}`
                                      : "0"
                                }
                                sx={{
                                  bgcolor:
                                    row.net > 0
                                      ? "#e0fce4"
                                      : row.net < 0
                                        ? "#fee2e2"
                                        : "#e5e7eb",
                                  color:
                                    row.net > 0
                                      ? "#16a34a"
                                      : row.net < 0
                                        ? "#dc2626"
                                        : "#171717",
                                  fontWeight: 700,
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Paper>
                </Box>
              )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, justifyContent: "center" }}>
            <Button
              onClick={() => setStatsOpen(false)}
              color="primary"
              variant="outlined"
              startIcon={<CloseIcon />}
              sx={{ borderRadius: 2, fontWeight: 700, minWidth: 90 }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
}

export default App;
