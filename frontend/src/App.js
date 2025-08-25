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
  Collapse,
  InputAdornment,
  ListItemIcon,
} from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
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
import { ThemeProvider, createTheme } from "@mui/material/styles";

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
//extract repo owner and name from url
const extractGitHubParts = (url) => {
  if (!url) return { owner: "", repo: "" };
  // Remove trailing dots or slashes for robustness
  const cleanedUrl = url.replace(/[./]+$/, "");
  const match = cleanedUrl.match(/[:\/]([^\/:]+)\/([^\/]+?)(?:\.git)?$/);
  return match ? { owner: match[1], repo: match[2] } : { owner: "", repo: "" };
};
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#10121a",
      paper: "#171928",
    },
    primary: { main: "#2563eb" },
    text: { primary: "#e5e7eb", secondary: "#a1a1aa" },
  },
});
const branchTypeColors = {
  aclp: "#2563eb", // blue (used for 'aclp')
  ankita: "#facc15", // yellow (used for 'ankita')
  linode: "#16a34a", // green (used for 'linode')
  nikil: "#64748b", // gray (nikil)
  origin: "#dc2626", // red (used for 'origin')
  santosh: "#a21caf", // purple (santosh)
  venky: "#0ea5e9", // cyan (venky)
  default: "#dc2626", // fallback gray
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

const stashChangesApi = async (stashMessage) => {
  const res = await fetch(`${API_URL}/stash`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: stashMessage }),
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
  const [addRemoteDialogOpen, setAddRemoteDialogOpen] = useState(false);
  const [newRemoteName, setNewRemoteName] = useState("");
  const [newRemoteUrl, setNewRemoteUrl] = useState("");
  const [isAddingRemote, setIsAddingRemote] = useState(false);
  const [remotes, setRemotes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [deletingBranches, setDeletingBranches] = useState(new Set());
  const [pendingCompareBranch, setPendingCompareBranch] = React.useState(null);
  const [runOutput, setRunOutput] = useState("");
  const [runError, setRunError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);
  const [stashAction, setStashAction] = useState("stash"); // "stash" or "unstash"
  const [unstashList, setUnstashList] = useState([]); // {ref, message}[]
  const [isStashListLoading, setIsStashListLoading] = useState(false);
  const [selectedUnstashMsg, setSelectedUnstashMsg] = useState("");
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [serverOutput, setServerOutput] = useState("");
  const [serverError, setServerError] = useState("");

  // Instead of opening and closing in same event tick:

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuBranch(null);
  };

  // Effect to open dialog after menu closes and pending branch is set
  React.useEffect(() => {
    if (!menuAnchorEl && pendingCompareBranch) {
      setSnackbar((prev) => ({ ...prev, open: false }));
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
  const handleCompareSelection = (branchName) => {
    setBaseBranch(branchName);
    setCompareDialogOpen(true);
    setPendingCompareBranch(null);
  };
  
  // Explicit dialog close handler:
  const handleDialogClose = () => {
    setCompareDialogOpen(false);
    setPendingCompareBranch(null);
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
  const RemoteActionsButton = ({
    setAddRemoteDialogOpen,
    handleOpenRemoveRemote,
  }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const open = Boolean(anchorEl);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleAddRemoteClick = () => {
      setAddRemoteDialogOpen(true);
      handleClose();
    };

    const handleRemoveRemoteClick = () => {
      handleOpenRemoveRemote();
      handleClose();
    };

    return (
      <>
        <AppButton
          onClick={handleClick}
          sx={{
            minWidth: 170,
            minHeight: 40,
            fontSize: 16,
            background: "linear-gradient(90deg, #334155 80%, #64748b 110%)",
            color: "#fff",
            boxShadow: "0 2px 8px #64748b66",
            textTransform: "none",
            px: 1.5,
            py: 0.5,
            borderRadius: 3, // Increased for more curvature
            "&:hover": {
              background: "linear-gradient(90deg, #1e293b 80%, #334155 100%)",
              border: "2px solid #64748b",
            },
          }}
        >
          Remote Actions
        </AppButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              bgcolor: "#232642",
              borderRadius: 3, // Match AppButton curvature
              minWidth: 170,
              boxShadow: "0px 4px 18px #17192855",
              mt: 1,
            },
          }}
          MenuListProps={{
            sx: {
              p: 0,
            },
          }}
        >
          <MenuItem
            onClick={handleAddRemoteClick}
            sx={{
              minHeight: 40,
              py: 0.5,
              px: 1.5,
              fontSize: 15,
              color: "#fff",
              gap: 1,
              borderRadius: 3, // Curved menu item
              "&:hover": {
                bgcolor: "#334155",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 26,
                color: "#fff",
                mr: 1,
              }}
            >
              <CloudUploadIcon fontSize="small" />
            </ListItemIcon>
            <span style={{ fontWeight: 500 }}>Add Remote</span>
          </MenuItem>
          <Divider sx={{ my: 0.5, bgcolor: "#3d4269" }} />{" "}
          {/* Custom divider color for dark theme */}
          <MenuItem
            onClick={handleRemoveRemoteClick}
            sx={{
              minHeight: 40,
              py: 0.5,
              px: 1.5,
              fontSize: 15,
              color: "#fff",
              gap: 1,
              borderRadius: 3, // Curved menu item
              "&:hover": {
                bgcolor: "#334155",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 26,
                color: "#fff",
                mr: 1,
              }}
            >
              <CloudOffIcon fontSize="small" />
            </ListItemIcon>
            <span style={{ fontWeight: 500 }}>Remove Remote</span>
          </MenuItem>
        </Menu>
      </>
    );
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

  const SuggestionPaper = (props) => (
    <Paper
      {...props}
      sx={{
        backgroundColor: "#171928",
        color: "#e5e7eb",
        width: "100%",
        mt: 1,
        maxHeight: 300,
        overflowY: "auto",
        borderRadius: 2,
        boxShadow: "0 8px 40px #00000030",
        ...props.sx,
      }}
    />
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
    setDeletingBranches((prev) => new Set(prev).add(branchName));

    try {
      const result = await deleteBranchApi(branchName);

      if (result && result.success) {
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
          message: (result && result.error) || "Delete failed.",
          severity: "error",
        });
        setConfirmDelete({ open: false, branchName: "" }); // CLOSE DIALOG ON ERROR TOO
      }
    } catch (e) {
      setSnackbar({
        open: true,
        message: e?.message || "Delete failed.",
        severity: "error",
      });
      setConfirmDelete({ open: false, branchName: "" }); // CLOSE DIALOG ON ERROR TOO
    } finally {
      setDeletingBranches((prev) => {
        const newSet = new Set(prev);
        newSet.delete(branchName);
        return newSet;
      });
    }
  };

  // Handler: Auto-fill or suggest name
  const handleRemoteUrlChange = (e) => {
    const url = e.target.value;
    setNewRemoteUrl(url);
    const suggestion = extractGitHubParts(url);
    if (!newRemoteName || newRemoteName === suggestion.owner) {
      setNewRemoteName(suggestion.owner ? suggestion.owner : "no owner");
    }
  };

  // Extracted name suggestion
  const suggestedName = extractGitHubParts(newRemoteUrl).repo;
  // Stash handler
  // state for stash message
  const [stashMessage, setStashMessage] = useState("");
  const [stashDialogOpen, setStashDialogOpen] = useState(false);
  const handleStashChanges = async () => {
    setIsStashing(true);
    setSnackbar({ open: false, message: "", severity: "info" });
    try {
      const data = await stashChangesApi(stashMessage); // stashMessage comes from dialog state
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

  const closeStashDialog = () => setStashDialogOpen(false);

  const openStashDialog = () => {
    const suggestedMessage = getDefaultStashMessage(currentBranch || "branch");

    setStashDialogOpen(true);
    setStashAction("stash");
    setStashMessage(suggestedMessage);
    setUnstashList([]);
    setSelectedUnstashMsg("");
  };

  const loadUnstashList = async () => {
    setIsStashListLoading(true);
    setSelectedUnstashMsg(null); // always reset here
    try {
      // Use search endpoint instead of old name-based endpoint
      const resp = await fetch(
        `${API_URL}/stashes/search/${encodeURIComponent(currentBranch)}`,
      );
      const data = await resp.json();
      setUnstashList(Array.isArray(data.stashes) ? data.stashes : []);
    } catch {
      setUnstashList([]);
    }
    setIsStashListLoading(false);
  };

  const handleConfirmStash = async () => {
    await handleStashChanges(stashMessage);
    setStashMessage(""); // clear after use
    closeStashDialog();
  };
  const getDefaultStashMessage = (branchName) => {
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "short" }); // Aug
    const hour = String(now.getHours()).padStart(2, "0"); // 11
    const minute = String(now.getMinutes()).padStart(2, "0"); // 45
    return `WIP: ${branchName}-${month}-${hour}-${minute}`;
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
    setServerOutput("");
    setServerError("");
    try {
      const resp = await fetch(`${API_URL}/start-service`);
      const data = await resp.json();
      if (data.success) {
        setServerOutput(data.output || data.message || "Service started.");
        setServerError("");
      } else {
        setServerOutput("");
        setServerError(data.error || "Failed to start service.");
      }
    } catch {
      setServerOutput("");
      setServerError("Failed to start service.");
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
      classes={{ tooltip: className }}
    />
  ))(() => ({
    [`&.${tooltipClasses.tooltip}`]: {
      background: "#fff",
      color: "#111", // Change here to solid black (#111 or use 'black')
      border: "1.5px solid #d1d5db",
      fontWeight: 600,
      fontSize: 15,
      borderRadius: 9,
      boxShadow: "0 4px 14px 2px #d1d5db",
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

      setSnackbar({ open: true, message: data.message, severity: "success" });

      const current = await getCurrentBranchApi();
      if (current.branch) setCurrentBranch(current.branch);

      // The dialog will close after spinner stops, see finally block
    } catch (error) {
      setSnackbar({ open: true, message: String(error), severity: "error" });
    } finally {
      setIsCheckingOut(false);
      // Small delay to let spinner/circular progress appear for a smooth feel
      setTimeout(() => {
        setIsCheckingOut(false); // Stop spinner, enable dialog actions/buttons
        setCheckoutDialogOpen(false); // Close dialog
      }, 100); // 200-400ms is enough for UX polish, not too long
    }
  };

  const BUTTON_BG = {
    primary: "linear-gradient(90deg, #0ea5e9 90%, #38bdf8 110%)", // blue
    green: "linear-gradient(90deg, #22c55e 60%, #4ade80 100%)", // green
    purple: "linear-gradient(90deg, #a21caf 60%, #e879f9 110%)", // purple
    red: "linear-gradient(90deg, #dc2626 60%, #f87171 110%)", // red
    gray: "linear-gradient(90deg, #334155 60%, #64748b 110%)", // gray
  };

  const BUTTON_HOVER = {
    primary: "linear-gradient(90deg, #2563eb 80%, #38bdf8 100%)",
    green: "linear-gradient(90deg, #16a34a 80%, #4ade80 100%)",
    purple: "linear-gradient(90deg, #7c3aed 80%, #a21caf 100%)",
    red: "linear-gradient(90deg, #b91c1c 80%, #dc2626 100%)",
    gray: "linear-gradient(90deg, #1e293b 80%, #334155 100%)",
  };

  const AppButton = ({
    children,
    onClick,
    disabled = false,
    startIcon = null,
    loading = false,
    color = "primary", // "green", "purple", "red", "gray" etc.
    variant = "contained",
    size = "medium",
    sx = {},
  }) => {
    const icon = loading ? (
      <CircularProgress color="inherit" size={18} />
    ) : (
      startIcon
    );

    const bg = BUTTON_BG[color] || BUTTON_BG.primary;
    const hoverBg = BUTTON_HOVER[color] || BUTTON_HOVER.primary;

    return (
      <Button
        variant={variant}
        size={size}
        disabled={disabled || loading}
        onClick={onClick}
        startIcon={icon}
        sx={{
          textTransform: "none",
          fontWeight: 500,
          fontSize: 14,
          borderRadius: 2.5,
          px: 2,
          py: 1.2,
          background: bg,
          color: "#fff",
          boxShadow: "0 2px 8px #0ea5e950",
          "&:hover": {
            background: hoverBg,
            border: "2px solid #fff2",
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
        { method: "DELETE" },
      );

      // Attempt to parse response (might fail if not JSON)
      let errorData = {};
      if (!response.ok) {
        try {
          errorData = await response.json();
        } catch {
          // If parsing fails (server sends no JSON), errorData remains {}
        }
        throw new Error(
          errorData.error ||
            `Failed to remove remote (code ${response.status})`,
        );
      }

      setRemotes(remotes.filter((r) => r !== selectedRemote));
      setSelectedRemote("");
      setRemoveRemoteDialogOpen(false);

      setSnackbar({
        open: true,
        message: `Remote '${selectedRemote}' removed successfully.`,
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to remove remote: ${error.message || "Unknown error"}`,
        severity: "error",
      });
    }
  };

  function extractUserStashMessage(stashMessage, branchName) {
    const prefix = `On ${branchName}: `;
    return stashMessage.startsWith(prefix)
      ? stashMessage.slice(prefix.length)
      : stashMessage;
  }

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
    setRunOutput(""); // <-- clear previous output immediately
    setRunError("");
    try {
      const resp = await fetch(`${API_URL}/run-automation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specPaths }),
      });
      const data = await resp.json();

      // Append all new output, or error if present
      if (data.output) setRunOutput((prev) => prev + data.output);
      if (data.error) setRunError((prev) => prev + data.error);
    } catch (e) {
      setRunError((prev) => prev + (e.message || "Error running specs"));
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

  //start
  const columns = [
    {
      field: "bugTicket",
      headerName: "BugTicket",
      minWidth: 120,
      flex: 0.9,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 1, height: 1 }}>
          <img
            src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/jira.svg"
            alt="Jira"
            style={{ width: 19, height: 19, display: "block", verticalAlign: "middle", filter: "brightness(2)" }}
          />
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: "#fff", lineHeight: 1 }}
          >
          Bug Ticket
          </Typography>
        </Box>
      ),
      
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: 1, pl: 0.5 }}>
          {params.value && params.value.startsWith("DI-") ? (
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
                  maxWidth: 150,
                  minWidth: 68,
                  height: 32,
                  fontWeight: 500,
                  fontSize: 15,
                  color: "#fff",
                  border: "2px solid #fff",
                  bgcolor: "#232642",
                  borderRadius: "16px",
                  boxShadow: "0 2px 8px #38bdf821",
                  px: 2,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  transition: "all .14s",
                  "&:hover": {
                    bgcolor: "#0ea5e9",
                    color: "#fff",
                    borderColor: "#38bdf8",
                    boxShadow: "0 4px 16px #38bdf84a",
                  },
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    px: 0,
                    lineHeight: "32px", // Force Chip label vertical center
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
                height: 32,
                fontWeight: 600,
                fontSize: 15,
                color: "#64748b",
                bgcolor: "#232642",
                border: "2px dashed #334155",
                borderRadius: "16px",
                boxShadow: "0 2px 8px #23264233",
                px: 2,
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                "& .MuiChip-label": {
                  lineHeight: "32px",
                  px: 0,
                }
              }}
            />
          )}
        </Box>
      ),
    },
    
    {
      field: "name",
      headerName: "Branch Name",
      minWidth: 120,
      flex: 1.2,
      renderHeader: () => (
        <span style={{ fontWeight: 700, color: "#fff" }}>Branch Name</span>
      ),
      renderCell: (params) => {
        const branchName = (params.value || "").toLowerCase();
        const foundRemote =
          remotes.find((remote) => branchName.includes(remote)) || "default";
        const color = branchTypeColors[foundRemote] || branchTypeColors.default;
        return (
          <FloatingWhiteTooltip title={params.value} arrow placement="top">
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
              <Typography
                noWrap
                sx={{
                  fontWeight: 500,
                  color: "#fff",
                  userSelect: "text",
                }}
              >
                {params.value}
              </Typography>
            </Box>
          </FloatingWhiteTooltip>
        );
      },
    },
    
    {
      field: "date",
      headerName: "Branch Creation Date",
      minWidth: 210,
      flex: 1,
      renderHeader: () => (
        <span style={{ fontWeight: 700, color: "#fff" }}>Creation Date</span>
      ),
      renderCell: (params) => (
        <span style={{ color: "#e0e7ef", fontWeight: 500 }}>
          {params.value || "-"}
        </span>
      ),
    },
    {
      field: "createdFrom",
      headerName: "Created From",
      minWidth: 210,
      flex: 1,
      renderHeader: () => (
        <span style={{ fontWeight: 700, color: "#fff" }}>Created From</span>
      ),
      renderCell: (params) => (
        <span style={{ color: "#e0e7ef", fontWeight: 600 }}>
          {params.value || "-"}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      renderHeader: () => (
        <FloatingWhiteTooltip title="Use the actions menu to Checkout or Delete a branch.">
          <span
            style={{
              display: "flex",
              alignItems: "center",
              fontWeight: 700,
              color: "#fff",
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
            <MoreVertIcon sx={{ color: "#fff" }} />
          </IconButton>
          {menuBranch === params.row.name && (
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  bgcolor: "#fff",
                  color: "#111",
                  boxShadow: 3,
                  borderRadius: 2,
                  minWidth: 160,
                  p: 0,
                },
              }}
            >
              {/* --- Checkout --- */}
              {params.row.name === currentBranch ? (
                <MenuItem
                  sx={{
                    color: "#a1a1aa", // gray for disabled
                    fontWeight: 700,
                    cursor: "not-allowed",
                    opacity: 0.7,
                    minWidth: 120,
                    display: "flex",
                    alignItems: "center",
                    "&:hover": { bgcolor: "#fff" },
                  }}
                  tabIndex={-1}
                  disableRipple
                  onClick={(e) => e.stopPropagation()}
                >
                  Checkout
                </MenuItem>
              ) : (
                <MenuItem
                  onClick={() => {
                    setCheckoutBranchName(params.row.name);
                    setCheckoutDialogOpen(true);
                    handleCloseMenu();
                  }}
                  sx={{
                    color: "#111", // black for active
                    fontWeight: 700,
                    minWidth: 120,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <CheckIcon fontSize="small" sx={{ mr: 1, color: "#111" }} />
                  Checkout
                </MenuItem>
              )}

              {/* --- Delete --- */}
              <MenuItem
                onClick={() => {
                  handleDelete(params.row.name);
                  handleCloseMenu();
                }}
                sx={{
                  color: "#dc2626",
                  fontWeight: 700,
                  minWidth: 120,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <DeleteIcon sx={{ color: "#dc2626", mr: 1 }} fontSize="small" />
                Delete
              </MenuItem>

              {/* --- Compare With... --- */}
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  setPendingCompareBranch(params.row.name);
                }}
                sx={{
                  color: "#64748b", // neutral gray (not blue)
                  fontWeight: 700,
                  minWidth: 120,
                  display: "flex",
                  alignItems: "center",
                  "&:hover": {
                    bgcolor: "#e0f2fe",
                    color: "#0ea5e9",
                  },
                  textTransform: "none",
                }}
              >
                <CompareArrowsIcon
                  fontSize="small"
                  sx={{ color: "#64748b", mr: 1, verticalAlign: "middle" }}
                />
                Compare With...
              </MenuItem>

              <Dialog
              open={compareDialogOpen}
              onClose={() => setCompareDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                  sx: {
                    bgcolor: "#fff", // White background for entire dialog
                    color: "#111", // Black text
                    borderRadius: 4,
                  },
                }}
              >
                <DialogTitle sx={{ color: "#0284c7", fontWeight: 700 }}>
                  Compare Branches
                </DialogTitle>
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
                          color: "#111", // black text for base chip
                          background: "#f1f5f9",
                        }}
                      />
                    ) : (
                      <Typography component="span" sx={{ ml: 1 }}>
                        -
                      </Typography>
                    )}
                  </Box>
                  {/* --- AUTOCOMPLETE START --- */}
                  <Autocomplete
                    options={branches
                      .map((b) => b.name)
                      .filter((name) => name !== baseBranch)}
                    value={compareBranch}
                    onChange={(_, val) => setCompareBranch(val || "")}
                    fullWidth
                    disableClearable
                    sx={{
                      mb: 2,
                      "& .MuiAutocomplete-input": { color: "#111" }, // black selected value
                      "& .MuiOutlinedInput-root": {
                        background: "#fff",
                        color: "#111",
                      },
                      "& .MuiInputLabel-root": { color: "#111" },
                    }}
                    PaperComponent={({ children }) => (
                      <Paper
                        sx={{
                          bgcolor: "#fff",
                          color: "#111",
                          borderRadius: 2,
                          boxShadow: 3,
                        }}
                      >
                        {children}
                      </Paper>
                    )}
                    renderOption={(props, option, { index }) => (
                      <React.Fragment key={option}>
                        <li
                          {...props}
                          style={{
                            color: "#111",
                            fontWeight: 500,
                            background: "#fff",
                            padding: "8px 16px",
                          }}
                        >
                          {option}
                        </li>
                        {/* Add divider after every option except last */}
                        {index <
                          branches
                            .map((b) => b.name)
                            .filter((name) => name !== baseBranch).length -
                            1 && <Divider sx={{ my: 0 }} />}
                      </React.Fragment>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select branch to compare with"
                        sx={{
                          input: { color: "#111" }, // black text
                          label: { color: "#111" }, // black label
                          bgcolor: "#fff",
                        }}
                      />
                    )}
                  />
                  {/* --- AUTOCOMPLETE END --- */}
                  {compareLoading && (
                    <Box textAlign="center" py={2}>
                      <CircularProgress />
                    </Box>
                  )}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={showChangeset}
                        onChange={(e) => setShowChangeset(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Show changed files (Files Changed Table)"
                    sx={{ mt: 1, color: "#111" }}
                  />
                  {compareResult && (
                    <Paper
                      variant="outlined"
                      sx={{ mt: 2, p: 2, bgcolor: "#fff" }}
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
                                      color: "#111",
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
                                      color: "#111",
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
                                sx={{ fontWeight: 700, mb: 1, color: "#111" }}
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
                                      <td
                                        style={{
                                          wordBreak: "break-all",
                                          color: "#111",
                                        }}
                                      >
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
                    variant="outlined"
                    sx={{
                      fontWeight: 700,
                      borderRadius: 2,
                      color: "#111",
                      borderColor: "#111",
                      backgroundColor: "#fff",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#f3f4f6",
                        borderColor: "#111",
                        color: "#111",
                        textTransform: "none"
                      },
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={!baseBranch || !compareBranch || compareLoading}
                    onClick={handleCompareBranches}
                    sx={{
                      fontWeight: 700,
                      borderRadius: 2,
                      color: "#111",
                      borderColor: "#111",
                      backgroundColor: "#fff",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#f3f4f6",
                        borderColor: "#111",
                        color: "#111",
                      },
                    }}
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

  //edd

  return (
    <ThemeProvider theme={darkTheme}>
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
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: "#171928", // Keep your dark background
            border: "2px solid #232642", // Change: Dark subtle border (not blue!)
            boxShadow: "none", // Remove all color glows!
            minHeight: 50,
          }}
        >
          {" "}
          <Box sx={{ width: "100%", mt: 4 }}>
            {/* Header Row: Logo + Title (side by side, top) */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <CloudPulseLogo />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  ml: 1.5,
                  color: "#fff", // Pure white title
                  whiteSpace: "nowrap",
                  letterSpacing: 1,
                }}
              >
                Git Dashboard
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
                background: "rgba(36, 39, 58, 0.88)", // like a soft panel look
                borderRadius: 3,
                px: 2.5,
                py: 2, // vertical padding for "table" button bar feel
                mb: 4, // margin to dashboard below
                boxShadow: "0 4px 24px 0 #181e2680",
                border: "1.5px solid #232642",
              }}
            >
              <AppButton
                color="grey"
                startIcon={<AddIcon />}
                onClick={() => {
                  setCreateBranchDialogOpen(true);
                  setCreateBranchRemote("");
                  setCreateBranchTarget("");
                  setCreateBranchName("");
                }}
                disabled={isOpeningCreateDialog}
                sx={{
                  minWidth: 128,
                  background:
                    "linear-gradient(90deg, #334155 80%, #64748b 110%)", // Slate grey gradient
                  color: "#fff",
                  boxShadow: "0 2px 8px #33415540",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #1e293b 80%, #334155 100%)",
                    border: "2px solid #64748b",
                  },
                }}
              >
                Create
              </AppButton>

              <AppButton
                color="grey"
                startIcon={<SyncIcon />}
                loading={isPulling}
                onClick={handlePull}
                disabled={isPulling}
                sx={{
                  minWidth: 128,
                  background:
                    "linear-gradient(90deg, #334155 80%, #64748b 110%)", // Slate grey gradient
                  color: "#fff",
                  boxShadow: "0 2px 8px #33415540",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #1e293b 80%, #334155 100%)",
                    border: "2px solid #64748b",
                  },
                }}
              >
                Pull
              </AppButton>

              <AppButton
                color="grey"
                startIcon={<SettingsBackupRestoreIcon />}
                loading={isStashing}
                onClick={openStashDialog}
                disabled={isStashing}
                sx={{
                  minWidth: 128,
                  background:
                    "linear-gradient(90deg, #334155 80%, #64748b 110%)", // Slate grey gradient
                  color: "#fff",
                  boxShadow: "0 2px 8px #33415540",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #1e293b 80%, #334155 100%)",
                    border: "2px solid #64748b",
                  },
                }}
              >
                Stash
              </AppButton>

              <Dialog
                open={stashDialogOpen}
                onClose={() => setStashDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                  sx: { backgroundColor: "#fff" }, // White background for dialog
                }}
              >
                <DialogTitle sx={{ color: "#111" }}>Stash Actions</DialogTitle>
                <DialogContent sx={{ backgroundColor: "#fff" }}>
                  <RadioGroup
                    row
                    value={stashAction}
                    onChange={(e) => {
                      const action = e.target.value;
                      setStashAction(action);
                      if (action === "unstash") {
                        setSelectedUnstashMsg(null);
                        loadUnstashList();
                      }
                    }}
                    sx={{ mb: 2 }}
                  >
                    <FormControlLabel
                      value="stash"
                      control={
                        <Radio
                          sx={{
                            color: "#000", // Unchecked color: black
                            "&.Mui-checked": { color: "#0ea5e9" }, // Checked color: your blue
                            "& .MuiSvgIcon-root": { fontSize: 22 }, // (Optional) Increase icon size
                          }}
                        />
                      }
                      label="Stash"
                      sx={{ color: "#000" }} // <- Ensures label is black
                    />

                    <FormControlLabel
                      value="unstash"
                      control={
                        <Radio
                          sx={{
                            color: "#111",
                            "&.Mui-checked": { color: "#0ea5e9" },
                          }}
                        />
                      }
                      label="Unstash"
                      sx={{ color: "#000" }} // <- Ensures label is black
                    />
                  </RadioGroup>

                  {stashAction === "stash" && (
                    <TextField
                      autoFocus
                      margin="dense"
                      label="Stash Message"
                      type="text"
                      fullWidth
                      value={stashMessage}
                      onChange={(e) => setStashMessage(e.target.value)}
                      placeholder='e.g. "WIP: fixing login bug"'
                      sx={{
                        backgroundColor: "#fff",
                        borderRadius: 1,
                        "& .MuiInputBase-root": { backgroundColor: "#fff" },
                        "& .MuiInputBase-input": { color: "#111" },
                        "& .MuiInputLabel-root": { color: "#111" },
                        "& .MuiFormHelperText-root": { color: "#666" },
                      }}
                    />
                  )}

                  {stashAction === "unstash" && (
                    <>
                      <Autocomplete
                        loading={isStashListLoading}
                        options={unstashList}
                        getOptionLabel={(option) =>
                          option && option.message
                            ? (() => {
                                const cleanMsg = extractUserStashMessage(
                                  option.message,
                                  currentBranch,
                                );
                                return cleanMsg.length > 80
                                  ? cleanMsg.slice(0, 80) + "..."
                                  : cleanMsg;
                              })()
                            : option?.ref || ""
                        }
                        value={selectedUnstashMsg}
                        onChange={(_, val) => setSelectedUnstashMsg(val)}
                        isOptionEqualToValue={(option, value) =>
                          option.ref === value?.ref
                        }
                        renderOption={(props, option) => {
                          const cleanMsg = extractUserStashMessage(
                            option.message,
                            currentBranch,
                          );
                          return (
                            <li
                              {...props}
                              key={option.ref}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                marginBottom: 2,
                                borderBottom: "1px solid #e0e0e0",
                                paddingBottom: 6,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "13px",
                                  color: "#64748b",
                                  marginBottom: 2,
                                }}
                              >
                                <code
                                  style={{
                                    background: "#e0e7ef",
                                    borderRadius: 4,
                                    padding: "0 4px",
                                    marginRight: 6,
                                  }}
                                >
                                  {option.ref}
                                </code>
                              </span>
                              <span
                                style={{
                                  fontSize: "15px",
                                  color: "#171717",
                                  wordBreak: "break-word",
                                  lineHeight: 1.3,
                                  maxWidth: 380,
                                }}
                                title={cleanMsg}
                              >
                                {cleanMsg.length > 90
                                  ? cleanMsg.slice(0, 90) + "..."
                                  : cleanMsg}
                              </span>
                            </li>
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select stash message to pop"
                            margin="dense"
                            fullWidth
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {isStashListLoading ? (
                                    <CircularProgress
                                      color="inherit"
                                      size={20}
                                    />
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                            sx={{
                              backgroundColor: "#fff",
                              borderRadius: 1,
                              "& .MuiInputBase-root": {
                                backgroundColor: "#fff",
                              },
                              "& .MuiInputBase-input": { color: "#111" },
                              "& .MuiInputLabel-root": { color: "#111" },
                              "& .MuiFormHelperText-root": { color: "#666" },
                              border: "1px solid #d1d5db",
                            }}
                          />
                        )}
                        noOptionsText="No stashes for this branch"
                        disabled={
                          isStashListLoading || unstashList.length === 0
                        }
                        PaperComponent={({ children }) => (
                          <Box
                            sx={{
                              backgroundColor: "#fff",
                              border: "1px solid #e5e7eb",
                              color: "#111",
                              "& .MuiAutocomplete-option": {
                                borderBottom: "1px solid #e5e7eb",
                              },
                              "& .MuiAutocomplete-option:last-child": {
                                borderBottom: "none",
                              },
                            }}
                          >
                            {children}
                          </Box>
                        )}
                      />

                      {!isStashListLoading && unstashList.length === 0 && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1, textAlign: "center" }}
                        >
                          No stashes found for this branch.
                        </Typography>
                      )}
                    </>
                  )}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "#fff" }}>
                  <Button
                    onClick={() => setStashDialogOpen(false)}
                    disabled={isStashListLoading}
                    sx={{ color: "#111" }} // Black text cancel
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={async () => {
                      setIsStashing(true);
                      try {
                        if (stashAction === "stash") {
                          const resp = await fetch(`${API_URL}/stash`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ stashMessage }),
                          });
                          const data = await resp.json();
                          setSnackbar({
                            open: true,
                            message:
                              data.message ||
                              (data.success ? "Stashed!" : "Failed to stash"),
                            severity: data.success ? "success" : "error",
                          });
                        } else if (stashAction === "unstash") {
                          if (!selectedUnstashMsg) {
                            setSnackbar({
                              open: true,
                              message: "Please select a stash to pop.",
                              severity: "error",
                            });
                            setIsStashing(false);
                            return;
                          }
                          const resp = await fetch(`${API_URL}/unstash`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              message: selectedUnstashMsg.message,
                            }),
                          });
                          const data = await resp.json();
                          setSnackbar({
                            open: true,
                            message:
                              data.message ||
                              (data.success
                                ? "Unstashed!"
                                : "Failed to unstash"),
                            severity: data.success ? "success" : "error",
                          });
                        }
                      } catch (err) {
                        setSnackbar({
                          open: true,
                          message: err.message || "Error",
                          severity: "error",
                        });
                      }
                      setIsStashing(false);
                      setStashDialogOpen(false);
                    }}
                    disabled={
                      isStashing ||
                      (stashAction === "stash" && !stashMessage.trim()) ||
                      (stashAction === "unstash" && !selectedUnstashMsg)
                    }
                    sx={{
                      backgroundColor: "#111", // Black button background
                      color: "#fff",
                      fontWeight: 700,
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#222",
                      },
                      "&.Mui-disabled": {
                        backgroundColor: "#cacaca",
                        color: "#fff",
                      },
                    }}
                  >
                    {isStashing ? "Processing..." : "Confirm"}
                  </Button>
                </DialogActions>
              </Dialog>

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
                    color="grey"
                    startIcon={<CompareArrowsIcon />} // arrows for switch/swap
                    onClick={handleOpenEnvSwitcher}
                    sx={{
                      minWidth: 128,
                      background:
                        "linear-gradient(90deg, #334155 80%, #64748b 110%)", // Slate grey gradient
                      color: "#fff",
                      boxShadow: "0 2px 8px #33415540",
                      "&:hover": {
                        background:
                          "linear-gradient(90deg, #1e293b 80%, #334155 100%)", // Deeper slate on hover
                        border: "2px solid #64748b",
                      },
                    }}
                  >
                    Switch
                  </AppButton>
                </span>
              </FloatingWhiteTooltip>

              <AppButton
                color="grey"
                startIcon={<PowerSettingsNewIcon />} // power/start symbol for start
                onClick={handleStartService}
                sx={{
                  minWidth: 128,
                  background:
                    "linear-gradient(90deg, #334155 80%, #64748b 110%)", // Cool slate grey
                  color: "#fff",
                  boxShadow: "0 2px 8px #33415540",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #1e293b 80%, #334155 100%)",
                    border: "2px solid #64748b",
                  },
                }}
              >
                Start
              </AppButton>

              <AppButton
                color="grey"
                onClick={() => setAutomationDialogOpen(true)}
                startIcon={<PlayCircleOutlineIcon />} // play symbol for run/test
                sx={{
                  minWidth: 128,
                  background:
                    "linear-gradient(90deg, #334155 80%, #64748b 110%)", // Cool slate grey
                  color: "#fff",
                  boxShadow: "0 2px 8px #33415540",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #1e293b 80%, #334155 100%)",
                    border: "2px solid #64748b",
                  },
                }}
              >
                Run Specs
              </AppButton>
              <div>
                <RemoteActionsButton
                  setAddRemoteDialogOpen={setAddRemoteDialogOpen}
                  handleOpenRemoveRemote={handleOpenRemoveRemote}
                />
                {addRemoteDialogOpen && <div>Your Add Remote Dialog here</div>}
              </div>
            </Box>

            <Dialog
              open={removeRemoteDialogOpen}
              onClose={() => setRemoveRemoteDialogOpen(false)}
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  minWidth: 400,
                  p: 1,
                  boxShadow: "0 8px 40px #6366f130", // subtle blue shadow for separation
                  backgroundColor: "#fff", // WHITE
                  color: "#1e293b", // Slate/Dark text
                  border: "1.5px solid #e0e7ef", // Subtle border
                },
              }}
            >
              <DialogTitle
                sx={{
                  color: "#1e293b", // dark header
                  fontWeight: 700,
                  textAlign: "center",
                  fontSize: 24,
                  pb: 0,
                  pt: 2,
                  letterSpacing: 0,
                  bgcolor: "#f8fafc", // very light gray for header
                  borderRadius: "8px 8px 0 0",
                  borderBottom: "1.5px solid #e5e7eb",
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
                  bgcolor: "#fff",
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
                      control={
                        <Radio
                          sx={{
                            color: "#2563eb",
                            "&.Mui-checked": { color: "#2563eb" },
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: 18, color: "#1e293b" }}>
                          {remote}
                        </Typography>
                      }
                      sx={{ my: 1 }}
                    />
                  ))}
                </RadioGroup>
                {remotes.length === 0 && (
                  <Typography sx={{ fontSize: 18, color: "#64748b" }}>
                    No remotes available
                  </Typography>
                )}
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2, bgcolor: "#fff" }}>
                <Button
                  onClick={() => setRemoveRemoteDialogOpen(false)}
                  sx={{
                    color: "#2C2D2D", // light black color hex
                    fontWeight: 700,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: 16,
                    border: "1.5px solid #2C2D2D", // border matching text color
                    background: "#f9fafb", // very light background for contrast
                    "&:hover": {
                      color: "#1f2020", // slightly darker on hover
                      border: "1.5px solid #1f2020",
                      background: "#e5e7eb", // subtle background on hover
                    },
                  }}
                  variant="outlined"
                >
                  Cancel
                </Button>

                <Button
                  variant="contained"
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
                    backgroundColor: "#111", // black background
                    color: "#fff", // white text
                    "&:hover": { backgroundColor: "#222" },
                    "&.Mui-disabled": {
                      backgroundColor: "#999",
                      color: "#2C2D2D",
                    },
                  }}
                >
                  Delete
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
                bgcolor: "#fff", // white dialog
                borderRadius: 4,
                border: "1.5px solid #e0e7ef",
                boxShadow: "0 8px 36px #94a3b840",
                minWidth: { xs: "95vw", sm: 540 },
                p: 1,
              },
            }}
          >
            <DialogTitle
              sx={{
                fontWeight: 800,
                color: "#1e293b",
                fontSize: 22,
                letterSpacing: 0,
                borderRadius: "14px 14px 0 0",
                bgcolor: "#f8fafc",
                borderBottom: "2px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
              }}
            >
              Run Cypress Automation
              <IconButton
                sx={{ ml: "auto", color: "#64748b" }}
                onClick={() => setAutomationDialogOpen(false)}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ py: 2, bgcolor: "#fff", color: "#1e293b" }}>
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
                      <Box
                        key={spec}
                        display="flex"
                        alignItems="center"
                        py={0.2}
                      >
                        <Checkbox
                          checked={checkedSpecs.includes(spec)}
                          onChange={() => {
                            let newChecked;
                            if (checkedSpecs.includes(spec)) {
                              newChecked = checkedSpecs.filter(
                                (s) => s !== spec,
                              );
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
                            color: "#1e293b",
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
              sx={{ borderTop: "1px solid #e0e7ef", bgcolor: "#f8fafc" }}
            >
              <Button
                onClick={() => setAutomationDialogOpen(false)}
                variant="outlined"
                sx={{
                  borderColor: "#d1d5db",
                  color: "#1e293b",
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  background: "#fff",
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#1e293b",
                    background: "#f3f3f3",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={checkedSpecs.length === 0}
                onClick={() => {
                  setAutomationDialogOpen(false);
                  handleRunSpecs(checkedSpecs);
                }}
                sx={{
                  bgcolor: "#1e293b",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#111827",
                  },
                }}
              >
                Run Selected{" "}
                {checkedSpecs.length > 0 ? `(${checkedSpecs.length})` : ""}
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={addRemoteDialogOpen}
            onClose={() => {
              setAddRemoteDialogOpen(false);
              setNewRemoteName("");
              setNewRemoteUrl("");
            }}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                bgcolor: "#fff",
                borderRadius: 4,
                border: "1.5px solid #e0e7ef",
                boxShadow: "0 8px 36px #94a3b840",
                minWidth: 400,
              },
            }}
          >
            <DialogTitle
              sx={{
                fontWeight: 800,
                color: "#1e293b",
                fontSize: 22,
                letterSpacing: 0,
                borderRadius: "14px 14px 0 0",
                bgcolor: "#f8fafc",
                borderBottom: "2px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
              }}
            >
              Add Git Remote
              <IconButton
                sx={{ ml: "auto", color: "#64748b" }}
                onClick={() => {
                  setAddRemoteDialogOpen(false);
                  setNewRemoteName("");
                  setNewRemoteUrl("");
                }}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ bgcolor: "#fff", color: "#1e293b", pb: 1.5 }}>
              <TextField
                label="Remote URL"
                value={newRemoteUrl ?? ""} // <- fallback to empty string
                onChange={handleRemoteUrlChange}
                fullWidth
                margin="normal"
                required
                sx={{
                  input: { color: "#1e293b" },
                  label: { color: "#1e293b" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#e5e7eb" },
                    "&:hover fieldset": { borderColor: "#d1d5db" },
                    "&.Mui-focused fieldset": { borderColor: "#1e293b" },
                  },
                }}
                InputLabelProps={{ style: { color: "#1e293b" } }}
              />

              <TextField
                label="Remote Name"
                value={newRemoteName ?? ""} // <- fallback to empty string
                onChange={(e) => setNewRemoteName(e.target.value)}
                fullWidth
                margin="normal"
                required
                sx={{
                  input: { color: "#1e293b" },
                  label: { color: "#1e293b" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#e5e7eb" },
                    "&:hover fieldset": { borderColor: "#d1d5db" },
                    "&.Mui-focused fieldset": { borderColor: "#1e293b" },
                  },
                }}
                InputLabelProps={{ style: { color: "#1e293b" } }}
                helperText={suggestedName ? `Suggested: ${suggestedName}` : ""}
              />
            </DialogContent>
            <DialogActions sx={{ bgcolor: "#f8fafc" }}>
              <Button
                onClick={() => {
                  setAddRemoteDialogOpen(false);
                  setNewRemoteName("");
                  setNewRemoteUrl("");
                }}
                variant="outlined"
                sx={{
                  borderColor: "#d1d5db",
                  color: "#1e293b",
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  background: "#fff",
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#1e293b",
                    background: "#f3f3f3",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddRemote}
                variant="contained"
                disabled={!newRemoteName || !newRemoteUrl || isAddingRemote}
                sx={{
                  background: "#fff", // White background
                  color: "#111", // Black text (or use "#000")
                  fontWeight: 700,
                  fontSize: 16,
                  borderRadius: 2,
                  textTransform: "none",
                  px: 3,
                  py: 1,
                  boxShadow: "0 2px 8px #64748b33",
                  "&:hover": {
                    background: "#f3f4f6", // Subtle light grey on hover
                    color: "#111",
                  },
                }}
                startIcon={
                  isAddingRemote && (
                    <CircularProgress color="inherit" size={18} />
                  )
                }
              >
                {isAddingRemote ? "Adding..." : "Create"}
              </Button>
            </DialogActions>
          </Dialog>
          {/* Create Branch Dialog */}
          <Dialog
            open={createBranchDialogOpen}
            onClose={() => setCreateBranchDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: { backgroundColor: "#fff" },
            }}
          >
            <DialogTitle
              sx={{ display: "flex", alignItems: "center", color: "#111" }}
            >
              Create New Branch
              <IconButton
                sx={{ ml: "auto", color: "#111" }}
                onClick={() => setCreateBranchDialogOpen(false)}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ backgroundColor: "#fff" }}>
              {/* Remote Repo Autocomplete */}
              <Autocomplete
                options={remotes}
                value={createBranchRemote}
                onChange={(_, val) => {
                  setCreateBranchRemote(val ?? "");
                  setCreateBranchTarget("");
                }}
                freeSolo={false}
                PaperComponent={({ children }) => (
                  <Box
                    sx={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      color: "#111",
                      "& .MuiAutocomplete-option": {
                        borderBottom: "1px solid #e5e7eb",
                      },
                      "& .MuiAutocomplete-option:last-child": {
                        borderBottom: "none",
                      },
                    }}
                  >
                    {children}
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Remote Repo"
                    fullWidth
                    margin="dense"
                    sx={{
                      "& .MuiInputBase-root": {
                        backgroundColor: "#fff",
                        color: "#111",
                        borderRadius: 1,
                        border: "1px solid #d1d5db",
                      },
                      "& .MuiInputBase-input": { color: "#111" },
                      "& .MuiInputLabel-root": { color: "#111" },
                      "& .MuiFormHelperText-root": { color: "#666" },
                    }}
                  />
                )}
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
                  sx={{
                    "& .MuiInputBase-root": {
                      backgroundColor: "#fff",
                      color: "#111",
                      borderRadius: 1,
                      border: "1px solid #d1d5db",
                    },
                    "& .MuiInputBase-input": { color: "#111" },
                    "& .MuiInputLabel-root": { color: "#111" },
                    "& .MuiFormHelperText-root": { color: "#666" },
                  }}
                />
              ) : createBranchRemote === "aclp" ? (
                <Autocomplete
                  freeSolo
                  options={["aclp_develop"]}
                  value={createBranchTarget}
                  onChange={(_, val) => setCreateBranchTarget(val ?? "")}
                  onInputChange={(_, val) => setCreateBranchTarget(val)}
                  PaperComponent={({ children }) => (
                    <Box
                      sx={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        color: "#111",
                        "& .MuiAutocomplete-option": {
                          borderBottom: "1px solid #e5e7eb",
                        },
                        "& .MuiAutocomplete-option:last-child": {
                          borderBottom: "none",
                        },
                      }}
                    >
                      {children}
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Target Branch"
                      fullWidth
                      margin="dense"
                      helperText="Autocomplete: aclp_develop"
                      sx={{
                        "& .MuiInputBase-root": {
                          backgroundColor: "#fff",
                          color: "#111",
                          borderRadius: 1,
                          border: "1px solid #d1d5db",
                        },
                        "& .MuiInputBase-input": { color: "#111" },
                        "& .MuiInputLabel-root": { color: "#111" },
                        "& .MuiFormHelperText-root": { color: "#666" },
                      }}
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
                  PaperComponent={({ children }) => (
                    <Box
                      sx={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        color: "#111",
                        "& .MuiAutocomplete-option": {
                          borderBottom: "1px solid #e5e7eb",
                        },
                        "& .MuiAutocomplete-option:last-child": {
                          borderBottom: "none",
                        },
                      }}
                    >
                      {children}
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Target Branch"
                      fullWidth
                      margin="dense"
                      helperText="Autocomplete: de, develop, staging"
                      sx={{
                        "& .MuiInputBase-root": {
                          backgroundColor: "#fff",
                          color: "#111",
                          borderRadius: 1,
                          border: "1px solid #d1d5db",
                        },
                        "& .MuiInputBase-input": { color: "#111" },
                        "& .MuiInputLabel-root": { color: "#111" },
                        "& .MuiFormHelperText-root": { color: "#666" },
                      }}
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
                  sx={{
                    "& .MuiInputBase-root": {
                      backgroundColor: "#fff",
                      color: "#111",
                      borderRadius: 1,
                      border: "1px solid #d1d5db",
                    },
                    "& .MuiInputBase-input": { color: "#111" },
                    "& .MuiInputLabel-root": { color: "#111" },
                    "& .MuiFormHelperText-root": { color: "#666" },
                  }}
                />
              )}

              <TextField
                label="New Branch Name"
                fullWidth
                margin="dense"
                value={createBranchName}
                onChange={(e) => setCreateBranchName(e.target.value)}
                helperText="Short descriptive name (no spaces)"
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "#fff",
                    color: "#111",
                    borderRadius: 1,
                    border: "1px solid #d1d5db",
                  },
                  "& .MuiInputBase-input": { color: "#111" },
                  "& .MuiInputLabel-root": { color: "#111" },
                  "& .MuiFormHelperText-root": { color: "#666" },
                }}
              />

              <Box
                sx={{
                  mt: 2,
                  color: "#6b7280",
                  fontSize: 14,
                  position: "sticky",
                }}
              >
                <strong>Will Create:</strong>{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(90deg,#0ea5e9,#2563eb,#f43f5e)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 700,
                  }}
                >
                  {createBranchName && createBranchRemote ? (
                    `${createBranchName}_${createBranchRemote}_${new Date().toLocaleString(
                      "en-US",
                      { month: "long" },
                    )}_${String(new Date().getDate()).padStart(2, "0")}`
                  ) : (
                    <i>Complete form above</i>
                  )}
                </span>
              </Box>
            </DialogContent>
            <DialogActions sx={{ backgroundColor: "#fff" }}>
              <Button
                variant="contained"
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
                  backgroundColor: "#111",
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  "&:hover": { backgroundColor: "#222" },
                  "&.Mui-disabled": {
                    backgroundColor: "#cacaca",
                    color: "#fff",
                  },
                }}
              >
                {isSubmittingCreate ? "Creating..." : "Create Branch"}
              </Button>

              <Button
                onClick={() => setCreateBranchDialogOpen(false)}
                sx={{ color: "#111" }}
              >
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
                Please commit or stash your changes before pulling, or force
                pull (this will <b>discard ALL uncommitted changes</b>).
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
            onClose={(event, reason) => {
              if (
                isCheckingOut &&
                (reason === "backdropClick" || reason === "escapeKeyDown")
              ) {
                return;
              }
              setCheckoutDialogOpen(false);
            }}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                bgcolor: "#fff",
                color: "#111",
                borderRadius: 3,
              },
            }}
          >
            {/* Show a loading bar at top when in progress */}
            {isCheckingOut && <LinearProgress color="primary" />}

            <DialogTitle
              sx={{
                display: "flex",
                alignItems: "center",
                color: "#0284c7",
                fontWeight: 700,
              }}
            >
              Checkout Branch
              <IconButton
                sx={{ ml: "auto", color: "#111" }}
                onClick={() => {
                  if (!isCheckingOut) setCheckoutDialogOpen(false);
                }}
                aria-label="close"
                disabled={isCheckingOut}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: "#fff", color: "#111" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  minHeight: 56,
                  mb: 1.5,
                }}
              >
                <Box sx={{ fontWeight: 700, fontSize: 16 }}>Branch Name:</Box>
                <Box
                  sx={{
                    display: "inline-block",
                    px: 2,
                    py: 1,
                    bgcolor: "#f7fafc",
                    color: "#111",
                    border: "1.5px solid #d1d5db",
                    borderRadius: 2,
                    fontSize: 17,
                    fontWeight: 700,
                    letterSpacing: 0.2,
                  }}
                >
                  {checkoutBranchName}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ bgcolor: "#fff" }}>
              <Button
                onClick={() => !isCheckingOut && setCheckoutDialogOpen(false)}
                disabled={isCheckingOut}
                variant="outlined"
                sx={{
                  color: "#111",
                  borderColor: "#111",
                  bgcolor: "#fff",
                  fontWeight: 700,
                  borderRadius: 2,
                  minWidth: 120,
                  "&:hover": {
                    bgcolor: "#f3f4f6",
                    borderColor: "#111",
                    color: "#111",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="outlined"
                disabled={!checkoutBranchName.trim() || isCheckingOut}
                onClick={handleCheckoutBranch}
                startIcon={
                  isCheckingOut ? (
                    <CircularProgress color="inherit" size={18} />
                  ) : null
                }
                sx={{
                  color: "#111",
                  borderColor: "#111",
                  bgcolor: "#fff",
                  fontWeight: 700,
                  borderRadius: 2,
                  minWidth: 120,
                  "&:hover": {
                    bgcolor: "#f3f4f6",
                    borderColor: "#111",
                    color: "#111",
                  },
                }}
              >
                {isCheckingOut ? "Checking out..." : "Checkout"}
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={envSwitcherOpen}
            onClose={handleCloseEnvSwitcher}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: { backgroundColor: "#fff" }, // main dialog white
            }}
          >
            <DialogTitle
              sx={{ display: "flex", alignItems: "center", color: "#111" }}
            >
              Switch Environment
              <IconButton
                sx={{ ml: "auto", color: "#111" }}
                onClick={handleCloseEnvSwitcher}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent
              dividers
              sx={{ backgroundColor: "#fff", color: "#111" }}
            >
              <Autocomplete
                options={ENV_OPTIONS}
                value={selectedEnv}
                onChange={(_, value) => setSelectedEnv(value)}
                PaperComponent={({ children }) => (
                  <Box
                    sx={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      color: "#111",
                      "& .MuiAutocomplete-option": {
                        borderBottom: "1px solid #e5e7eb",
                      },
                      "& .MuiAutocomplete-option:last-child": {
                        borderBottom: "none",
                      },
                    }}
                  >
                    {children}
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Environment"
                    fullWidth
                    margin="dense"
                    autoFocus
                    sx={{
                      "& .MuiInputBase-root": {
                        backgroundColor: "#fff",
                        color: "#111",
                        borderRadius: 1,
                        border: "1px solid #d1d5db",
                      },
                      "& .MuiInputBase-input": { color: "#111" },
                      "& .MuiInputLabel-root": { color: "#111" },
                      "& .MuiFormHelperText-root": { color: "#666" },
                    }}
                  />
                )}
              />
              {envMessage && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {envMessage}
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ backgroundColor: "#fff" }}>
              <Button
                onClick={handleCloseEnvSwitcher}
                disabled={envLoading}
                sx={{ color: "#111" }} // black text
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={!selectedEnv || envLoading}
                onClick={handleConfirmEnvSwitch}
                startIcon={
                  envLoading ? (
                    <CircularProgress color="inherit" size={18} />
                  ) : null
                }
                sx={{
                  backgroundColor: "#111",
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  "&:hover": { backgroundColor: "#222" },
                  "&.Mui-disabled": {
                    backgroundColor: "#cacaca",
                    color: "#fff",
                  },
                }}
              >
                {envLoading ? "Switching..." : "Confirm"}
              </Button>
            </DialogActions>
          </Dialog>
          <Box
            sx={{
              width: "100%",
              maxWidth: 1300,
              mt: 3,
              ml: 0, // no left margin
              mr: "auto", // pushes box to the left
              bgcolor: "#171928",
              borderRadius: 3,
              boxShadow: "0 8px 40px #00000030",
              p: 0, // remove padding if you want the content itself at the edge
            }}
          >
            {/* Inner box for search and count; left-aligned */}
            <Box
              sx={{
                width: "100%",
                bgcolor: "#101221",
                borderRadius: 2.5,
                px: 2, // Reduce! (Was 3) for less left spacing
                pt: 2,
                pb: 2,
                mb: 2,
                boxShadow: "0px 2px 16px 0px #00000018",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start", // Ensures children are left-aligned
              }}
            >
              <Box sx={{ width: "100%", maxWidth: 900 }}>
                {/* Set a maxWidth here if you want only a partial width search, else leave "100%" */}
                <Autocomplete
                  freeSolo
                  disablePortal
                  options={filteredSuggestions ?? []}
                  inputValue={search}
                  components={SuggestionPaper}
                  noOptionsText="No matching branches found"
                  onInputChange={(event, newInputValue, reason) => {
                    setSearch(newInputValue);
                    if (reason === "clear" || newInputValue === "")
                      setQuery("");
                  }}
                  onChange={(event, newValue) => {
                    if (newValue !== null) {
                      setQuery(newValue);
                      setSearch(newValue);
                    }
                  }}
                  sx={{ width: "Auto", maxWidth: 900 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search branches..."
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon
                              sx={{ color: "#7b85a9", mr: 1.5, fontSize: 28 }}
                            />
                          </InputAdornment>
                        ),
                        sx: {
                          bgcolor: "#181a28",
                          color: "#e5e7eb",
                          borderRadius: 2,
                          border: "1.5px solid #334155",
                          fontSize: "1.3rem",
                          minHeight: 56,
                          input: {
                            fontSize: "1.2rem",
                            py: 2,
                            px: 1.5,
                            color: "#e5e7eb",
                            height: "auto",
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            border: "1.5px solid #7b85a9",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            border: "2px solid #50fa7b",
                          },
                        },
                      }}
                      InputLabelProps={{ style: { color: "#fff" } }}
                    />
                  )}
                />
              </Box>

              {/* Branch count: aligns with search input */}
              <Typography
                variant="body2"
                sx={{ mt: 1.5, color: "#7b85a9", pl: "8px" }} // Adjust pl so text starts with input text
              >
                {(filteredSuggestions ?? []).length} branches found
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              mt: 2,
              ml: 3, // Keep alignment with table content, adjust as needed
              bgcolor: "#232642", // Darker background matches screenshot
              px: 2.5, // Padding left and right
              py: 1.2, // Padding top and bottom
              borderRadius: 2.5, // Rounded edges, tweak for more/less
              display: "inline-flex", // Only wrap content
              alignItems: "center",
              boxShadow: "0 2px 12px #00000030", // Softer shadow for "floating" effect
              maxWidth: 1, // allow full container width if needed
            }}
          >
            {/* Label */}
            <Box
              sx={{
                fontSize: 20,
                fontWeight: 500,
                color: "#fff",
                mr: 1, // Space between label and branch name
              }}
            >
              Current Branch:
            </Box>

            {/* Branch name */}
            <FloatingWhiteTooltip title={currentBranch || "Loading..."}>
              <Box
                component="button"
                onClick={handleShowBranchLog}
                sx={{
                  fontSize: 20,
                  fontWeight: 500,
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#2563eb",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "400px",
                  p: 0,
                }}
              >
                {currentBranch || "Loading..."}
              </Box>
            </FloatingWhiteTooltip>
          </Box>
          {/* Branch Table */}
          <Box sx={{ mb: 1 }}></Box>
          <Paper
            elevation={4}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: "#171928",
              border: "2.5px solid #334155",
              boxShadow: "none",
              mb: 3,
            }}
          >
            <Box sx={{ mt: 3, mb: 2 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: "#171928", // Dashboard dark
                  border: "2px solid #232642", // Light grey
                  boxShadow: "none",
                  minHeight: 50,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    sx={{ fontWeight: 700, fontSize: 17, mr: 1, color: "#fff" }}
                  >
                    Cypress Output
                  </Typography>
                  <Tooltip title={outputOpen ? "Minimize" : "Maximize"}>
                    <IconButton
                      size="small"
                      onClick={() => setOutputOpen((o) => !o)}
                    >
                      {outputOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copy Output">
                    <IconButton
                      size="small"
                      sx={{ ml: 0.5 }}
                      onClick={() => {
                        navigator.clipboard.writeText(
                          runOutput + (runError ? "\n" + runError : ""),
                        );
                        setSnackbar({
                          open: true,
                          message: "Output copied to clipboard!",
                          severity: "success",
                        });
                      }}
                    >
                      <ContentCopyIcon sx={{ color: "#fff" }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Collapse in={outputOpen}>
                  <Box
                    sx={{
                      bgcolor: "#10121a", // Very dark background
                      color: "#e0e7ef", // Light gray text
                      borderRadius: 2,
                      p: 2,
                      whiteSpace: "pre-wrap",
                      fontFamily: "monospace",
                      fontSize: 14,
                      minHeight: 120,
                      overflowY: "auto",
                      mt: 1,
                    }}
                  >
                    {isRunning
                      ? "Running specs..."
                      : runOutput || runError || "No Cypress output yet."}
                  </Box>
                </Collapse>
              </Paper>
            </Box>

            <Box
              sx={{
                bgcolor: "#171928",
                border: "2px solid #232642",
                borderRadius: "14px",
                boxShadow: "none",
                p: 0,
                mt: 2,
                maxWidth: "850", // Fixed max width
                width: "100%",
                mx: "auto",
                overflow: "hidden",
              }}
            >
              <DataGrid
                style={{ width: "100%", height: "auto" }}
                elevation={4}
                initialState={{
                  sorting: {
                    sortModel: [{ field: "date", sort: "desc" }],
                  },
                }}
                rows={branches}
                columns={columns}
                pageSize={pageSize}
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
                  border: "1.5px solid #334155 !important", // force grey
                  borderColor: "#334155 !important", // force grey
                  borderRadius: "14px",
                  "& .MuiDataGrid-columnHeaders": {
                    borderBottom: "2px solid #64748b",
                  },
                  "& .MuiDataGrid-footerContainer": {
                    borderTop: "2px solid #64748b",
                  },
                  "&.Mui-focused, &.Mui-focusVisible": {
                    outline: "none",
                    borderColor: "#64748b",
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
                  bgcolor: "#fff", // White background
                  color: "#111", // Black text
                  borderRadius: 4,
                  p: 2,
                  minWidth: { xs: "95vw", sm: 540 },
                },
              }}
            >
              <DialogTitle sx={{ fontWeight: 700, color: "black" }}>
                Commit History ─ {currentBranch}
              </DialogTitle>
              <DialogContent
                sx={{
                  maxHeight: 500,
                  overflowY: "auto",
                  bgcolor: "#fff",
                  color: "#111",
                }}
              >
                {branchLogLoading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", my: 4 }}
                  >
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
                          bgcolor: "#fff", // White background for each commit
                          boxShadow: "none",
                          borderLeft: "6px solid #0ea5e9",
                        }}
                      >
                        {/* --- Changed Part --- */}
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
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    color: "#111",
                    borderColor: "#111",
                    "&:hover": {
                      borderColor: "#111",
                      backgroundColor: "#e5e7eb",
                    },
                  }}
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
              <Typography
                variant="body1"
                sx={{ fontSize: 18, color: "#164e63" }}
              >
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
                onClick={() =>
                  setConfirmDelete({ open: false, branchName: "" })
                }
                disabled={deletingBranches.has(confirmDelete.branchName)}
              >
                Cancel
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
                fontWeight: "bold",
                color: "black",
              }}
            >
              <GitHubIcon sx={{ color: "#0ea5e9" }} />
              <span>{statsBranch}</span>
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
                          <tr style={{ fontWeight: "bold", color: "black" }}>
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
                                  fontWeight: 500,
                                  wordBreak: "break-all",
                                  color: "black",
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
    </ThemeProvider>
  );
}

export default App;
